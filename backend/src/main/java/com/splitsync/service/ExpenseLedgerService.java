package com.splitsync.service;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.splitsync.dto.common.ListResponse;
import com.splitsync.dto.expense.CreateExpenseRequest;
import com.splitsync.dto.expense.ExpenseResponse;
import com.splitsync.dto.expense.SplitRequest;
import com.splitsync.entity.Expense;
import com.splitsync.entity.ExpenseGroup;
import com.splitsync.entity.ExpenseSplit;
import com.splitsync.entity.GroupMember;
import com.splitsync.entity.User;
import com.splitsync.entity.enums.NotificationType;
import com.splitsync.entity.enums.SplitType;
import com.splitsync.exception.ApiException;
import com.splitsync.exception.ApiExceptions;
import com.splitsync.exception.ErrorCode;
import com.splitsync.repository.ExpenseRepository;
import com.splitsync.repository.GroupMemberRepository;
import com.splitsync.service.fx.ExchangeRateService;
import com.splitsync.util.Currencies;
import com.splitsync.util.Money;

import jakarta.persistence.criteria.Subquery;
import lombok.RequiredArgsConstructor;

/**
 * Records expenses. The original amount and currency are stored untouched; the amount is converted once to
 * the group's base currency using a snapshot exchange rate, and every split is computed from that base
 * amount so the shares always add up to it exactly.
 */
@Service
@RequiredArgsConstructor
public class ExpenseLedgerService {

    public static final int DEFAULT_PAGE_SIZE = 50;
    public static final int MAX_PAGE_SIZE = 100;

    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);
    private static final String DEFAULT_CATEGORY = "Other";
    private static final Map<String, String> CATEGORY_COLORS = Map.of(
            "Food & Drink", "#f59e0b",
            "Accommodation", "#6366f1",
            "Transport", "#3b82f6",
            "Activities", "#10b981",
            "Utilities", "#f59e0b",
            "Home", "#10b981",
            "Wellness", "#ec4899",
            "Rent", "#6366f1");
    private static final String DEFAULT_CATEGORY_COLOR = "#94a3b8";

    private final ExpenseRepository expenseRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final GroupAccessService groupAccessService;
    private final ExchangeRateService exchangeRateService;
    private final SettlementService settlementService;
    private final AuditService auditService;
    private final NotificationService notificationService;

    public record ExpenseFilter(UUID groupId, String category, Instant from, Instant to, String cursor,
            Integer limit) {
    }

    private record Participants(List<UUID> userIds, List<BigDecimal> weights, List<BigDecimal> percentages) {
    }

    @Transactional
    public ExpenseResponse create(UUID userId, CreateExpenseRequest request) {
        ExpenseGroup group = groupAccessService.lockForMember(request.groupId(), userId);
        String currency = Currencies.normalize(request.currency(), "currency");

        Map<UUID, User> members = new LinkedHashMap<>();
        for (GroupMember member : groupMemberRepository.findByIdGroupIdOrderByJoinedAtAsc(group.getId())) {
            members.put(member.getUser().getId(), member.getUser());
        }
        User payer = members.get(request.paidByUserId());
        if (payer == null) {
            throw ApiExceptions.invalidField("paidByUserId", "The payer must be a member of this group");
        }

        BigDecimal originalAmount = Money.of(request.amount());
        SplitType splitType = request.splitType() == null ? SplitType.EQUAL : request.splitType();
        Participants participants = resolveParticipants(splitType, request.splits(), originalAmount, members);

        BigDecimal rate = currency.equals(group.getBaseCurrency())
                ? BigDecimal.ONE.setScale(ExchangeRateService.RATE_SCALE)
                : exchangeRateService.getRate(currency, group.getBaseCurrency());
        BigDecimal baseAmount = Money.of(originalAmount.multiply(rate));
        if (baseAmount.signum() <= 0) {
            throw ApiExceptions.invalidField("amount", "Amount is too small to convert to " + group.getBaseCurrency());
        }
        List<BigDecimal> shares = Money.allocate(baseAmount, participants.weights());

        String category = request.category() == null || request.category().isBlank()
                ? DEFAULT_CATEGORY : request.category().trim();
        Expense expense = new Expense();
        expense.setGroup(group);
        expense.setPaidBy(payer);
        expense.setTitle(request.title().trim());
        expense.setCategory(category);
        expense.setCategoryColor(CATEGORY_COLORS.getOrDefault(category, DEFAULT_CATEGORY_COLOR));
        expense.setAmount(originalAmount);
        expense.setCurrency(currency);
        expense.setExchangeRate(rate);
        expense.setBaseAmount(baseAmount);
        expense.setSplitType(splitType);
        expense.setReceiptUrl(request.receiptUrl());
        expense.setOccurredAt((request.occurredAt() == null ? Instant.now() : request.occurredAt())
                .truncatedTo(ChronoUnit.MILLIS));
        for (int i = 0; i < shares.size(); i++) {
            ExpenseSplit split = new ExpenseSplit();
            split.setUser(members.get(participants.userIds().get(i)));
            split.setAmountOwed(shares.get(i));
            split.setPercentage(participants.percentages() == null ? null : participants.percentages().get(i));
            expense.addSplit(split);
        }
        expenseRepository.saveAndFlush(expense);
        group.setUpdatedAt(Instant.now());

        settlementService.rebuildPendingSettlements(group);

        User actor = members.get(userId);
        String summary = expense.getTitle() + " · " + currency + " " + originalAmount;
        auditService.record(group, actor, "expense.created", Map.of(
                "expenseId", expense.getId().toString(),
                "title", expense.getTitle(),
                "amount", originalAmount.toPlainString(),
                "currency", currency,
                "baseAmount", baseAmount.toPlainString()));
        Set<UUID> notified = new HashSet<>(participants.userIds());
        notified.add(payer.getId());
        notified.remove(userId);
        for (UUID recipientId : notified) {
            notificationService.notify(members.get(recipientId), NotificationType.EXPENSE,
                    actor.getName() + " added an expense in " + group.getName(), summary,
                    Map.of("groupId", group.getId().toString(), "expenseId", expense.getId().toString()));
        }

        return ExpenseResponse.from(expense, userId);
    }

    @Transactional(readOnly = true)
    public ExpenseResponse get(UUID expenseId, UUID userId) {
        Expense expense = expenseRepository.findById(expenseId)
                .filter(e -> groupAccessService.isMember(e.getGroup().getId(), userId))
                .orElseThrow(() -> ApiExceptions.notFound("Expense"));
        return ExpenseResponse.from(expense, userId);
    }

    /** Newest first, keyset-paginated on (occurredAt, id) so pages stay consistent while expenses are added. */
    @Transactional(readOnly = true)
    public ListResponse<ExpenseResponse> list(UUID userId, ExpenseFilter filter) {
        int limit = filter.limit() == null ? DEFAULT_PAGE_SIZE : Math.clamp(filter.limit(), 1, MAX_PAGE_SIZE);

        Specification<Expense> spec = visibleTo(userId);
        if (filter.groupId() != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("group").get("id"), filter.groupId()));
        }
        if (filter.category() != null && !filter.category().isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("category"), filter.category().trim()));
        }
        if (filter.from() != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("occurredAt"), filter.from()));
        }
        if (filter.to() != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("occurredAt"), filter.to()));
        }
        long total = expenseRepository.count(spec);

        if (filter.cursor() != null && !filter.cursor().isBlank()) {
            Cursor cursor = Cursor.decode(filter.cursor());
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.lessThan(root.get("occurredAt"), cursor.occurredAt()),
                    cb.and(cb.equal(root.get("occurredAt"), cursor.occurredAt()),
                            cb.lessThan(root.get("id"), cursor.id()))));
        }

        Sort sort = Sort.by(Sort.Direction.DESC, "occurredAt").and(Sort.by(Sort.Direction.DESC, "id"));
        List<Expense> rows = expenseRepository.findBy(spec, q -> q.sortBy(sort).limit(limit + 1).all());
        boolean hasMore = rows.size() > limit;
        List<Expense> page = hasMore ? rows.subList(0, limit) : rows;
        String nextCursor = hasMore ? new Cursor(page.getLast().getOccurredAt(), page.getLast().getId()).encode() : null;

        return new ListResponse<>(page.stream().map(e -> ExpenseResponse.from(e, userId)).toList(), total, nextCursor);
    }

    private Participants resolveParticipants(SplitType splitType, List<SplitRequest> splits,
            BigDecimal originalAmount, Map<UUID, User> members) {
        boolean noSplits = splits == null || splits.isEmpty();
        if (noSplits && splitType != SplitType.EQUAL) {
            throw ApiExceptions.invalidField("splits", "Splits are required for " + splitType.dbValue() + " splits");
        }

        List<UUID> userIds = noSplits
                ? new ArrayList<>(members.keySet())
                : splits.stream().map(SplitRequest::userId).toList();
        if (new HashSet<>(userIds).size() != userIds.size()) {
            throw ApiExceptions.invalidField("splits", "Each member can appear only once in the splits");
        }
        if (!members.keySet().containsAll(userIds)) {
            throw ApiExceptions.invalidField("splits", "Everyone in the split must be a member of this group");
        }

        return switch (splitType) {
            case EQUAL -> new Participants(userIds, userIds.stream().map(id -> BigDecimal.ONE).toList(), null);
            case EXACT -> {
                List<BigDecimal> amounts = splits.stream().map(SplitRequest::amount).toList();
                if (amounts.contains(null)) {
                    throw ApiExceptions.invalidField("splits", "Every exact split needs an amount");
                }
                BigDecimal sum = amounts.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
                if (sum.compareTo(originalAmount) != 0) {
                    throw ApiExceptions.invalidField("splits",
                            "Split amounts add up to " + Money.of(sum) + " but the expense is " + originalAmount);
                }
                yield new Participants(userIds, amounts, null);
            }
            case PERCENTAGE -> {
                List<BigDecimal> percentages = splits.stream().map(SplitRequest::percentage).toList();
                if (percentages.contains(null)) {
                    throw ApiExceptions.invalidField("splits", "Every percentage split needs a percentage");
                }
                BigDecimal sum = percentages.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
                if (sum.compareTo(ONE_HUNDRED) != 0) {
                    throw ApiExceptions.invalidField("splits", "Percentages add up to " + sum + " instead of 100");
                }
                yield new Participants(userIds, percentages, percentages);
            }
        };
    }

    private static Specification<Expense> visibleTo(UUID userId) {
        return (root, query, cb) -> {
            Subquery<UUID> memberGroups = query.subquery(UUID.class);
            var gm = memberGroups.from(GroupMember.class);
            memberGroups.select(gm.get("id").get("groupId")).where(cb.equal(gm.get("id").get("userId"), userId));
            return root.get("group").get("id").in(memberGroups);
        };
    }

    private record Cursor(Instant occurredAt, UUID id) {

        String encode() {
            return Base64.getUrlEncoder().withoutPadding()
                    .encodeToString((occurredAt + "|" + id).getBytes(StandardCharsets.UTF_8));
        }

        static Cursor decode(String value) {
            try {
                String[] parts = new String(Base64.getUrlDecoder().decode(value), StandardCharsets.UTF_8).split("\\|");
                return new Cursor(Instant.parse(parts[0]), UUID.fromString(parts[1]));
            } catch (IllegalArgumentException | DateTimeParseException | ArrayIndexOutOfBoundsException ex) {
                throw new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.MALFORMED_REQUEST, "Invalid cursor");
            }
        }
    }
}
