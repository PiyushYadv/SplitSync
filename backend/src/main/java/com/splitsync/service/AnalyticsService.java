package com.splitsync.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Limit;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.splitsync.dto.analytics.AnalyticsResponse;
import com.splitsync.dto.analytics.AnalyticsResponse.AuditEntry;
import com.splitsync.dto.analytics.AnalyticsResponse.CategoryAmount;
import com.splitsync.dto.analytics.AnalyticsResponse.MonthAmount;
import com.splitsync.dto.common.UserSummary;
import com.splitsync.entity.AuditLog;
import com.splitsync.entity.ExpenseGroup;
import com.splitsync.exception.ApiExceptions;
import com.splitsync.repository.AuditLogRepository;
import com.splitsync.repository.ExpenseGroupRepository;
import com.splitsync.repository.ExpenseRepository;
import com.splitsync.repository.UserSettingsRepository;
import com.splitsync.repository.projection.CurrencyAmount;
import com.splitsync.repository.projection.SpendBucket;
import com.splitsync.service.fx.CurrencyConverter;
import com.splitsync.util.Categories;
import com.splitsync.util.Currencies;
import com.splitsync.util.Money;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private static final int DEFAULT_MONTHS = 12;
    private static final int AUDIT_ENTRIES = 20;
    private static final DateTimeFormatter MONTH = DateTimeFormatter.ofPattern("yyyy-MM");

    private final ExpenseGroupRepository groupRepository;
    private final ExpenseRepository expenseRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final GroupAccessService groupAccessService;
    private final CurrencyConverter currencyConverter;

    /**
     * Defaults to the last 12 calendar months (UTC) and the user's preferred currency. Each (currency, month,
     * category) bucket is converted once, so mixed-currency groups add up in one currency.
     */
    @Transactional(readOnly = true)
    public AnalyticsResponse summary(UUID userId, Instant from, Instant to, UUID groupId, String currencyParam) {
        String currency = currencyParam != null && !currencyParam.isBlank()
                ? Currencies.normalize(currencyParam, "currency")
                : userSettingsRepository.findById(userId).map(s -> s.getCurrency()).orElse("USD");
        Instant end = to != null ? to : Instant.now();
        Instant start = from != null ? from
                : YearMonth.from(end.atZone(ZoneOffset.UTC)).minusMonths(DEFAULT_MONTHS - 1L)
                        .atDay(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        if (start.isAfter(end)) {
            throw ApiExceptions.invalidField("from", "'from' must be before 'to'");
        }

        Map<UUID, ExpenseGroup> groups = new LinkedHashMap<>();
        if (groupId != null) {
            ExpenseGroup group = groupAccessService.requireMember(groupId, userId);
            groups.put(group.getId(), group);
        } else {
            groupRepository.findAllForMember(userId).forEach(g -> groups.put(g.getId(), g));
        }

        // Months in range, oldest first, all starting at zero so the chart has no gaps.
        Map<String, BigDecimal> byMonth = new LinkedHashMap<>();
        YearMonth last = YearMonth.from(end.atZone(ZoneOffset.UTC));
        for (YearMonth m = YearMonth.from(start.atZone(ZoneOffset.UTC)); !m.isAfter(last); m = m.plusMonths(1)) {
            byMonth.put(m.format(MONTH), Money.of(BigDecimal.ZERO));
        }
        Map<String, BigDecimal> byCategory = new HashMap<>();
        BigDecimal total = Money.of(BigDecimal.ZERO);
        BigDecimal yourShare = Money.of(BigDecimal.ZERO);

        if (!groups.isEmpty()) {
            for (SpendBucket bucket : expenseRepository.sumSpendBuckets(groups.keySet(), start, end)) {
                BigDecimal amount = currencyConverter.convert(bucket.getAmount(), bucket.getCurrency(), currency);
                byMonth.merge(bucket.getMonth(), amount, BigDecimal::add);
                byCategory.merge(bucket.getCategory(), amount, BigDecimal::add);
                total = total.add(amount);
            }
            for (CurrencyAmount share : expenseRepository.sumShareByCurrency(userId, groups.keySet(), start, end)) {
                yourShare = yourShare.add(currencyConverter.convert(share.getAmount(), share.getCurrency(), currency));
            }
        }

        List<CategoryAmount> categories = byCategory.entrySet().stream()
                .map(e -> new CategoryAmount(e.getKey(), e.getValue(), Categories.colorOf(e.getKey())))
                .sorted(Comparator.comparing(CategoryAmount::amount).reversed().thenComparing(CategoryAmount::name))
                .toList();
        List<MonthAmount> monthly = byMonth.entrySet().stream()
                .map(e -> new MonthAmount(e.getKey(), e.getValue()))
                .toList();
        BigDecimal average = total.divide(BigDecimal.valueOf(Math.max(1, monthly.size())), Money.SCALE,
                RoundingMode.HALF_EVEN);

        List<AuditEntry> audit = groups.isEmpty() ? List.of()
                : auditLogRepository.findByGroupIdInOrderByCreatedAtDesc(groups.keySet(), Limit.of(AUDIT_ENTRIES))
                        .stream().map(log -> toAuditEntry(log, userId)).toList();

        return new AnalyticsResponse(currency, start, end, total, yourShare, average,
                categories.isEmpty() ? null : categories.getFirst(), monthly, categories, audit);
    }

    private static AuditEntry toAuditEntry(AuditLog log, UUID userId) {
        Map<String, Object> details = log.getDetails() == null ? Map.of() : log.getDetails();
        String[] labelAndType = switch (log.getAction()) {
            case "expense.created" -> new String[] { "Added expense", "add" };
            case "settlement.paid" -> new String[] { "Settled up", "settle" };
            case "group.created" -> new String[] { "Created group", "group" };
            case "group.members_invited" -> new String[] { "Invited members", "invite" };
            case "invitation.accepted" -> new String[] { "Joined group", "join" };
            case "invitation.declined" -> new String[] { "Declined invitation", "invite" };
            case "group.member_left" -> new String[] { "Left group", "leave" };
            default -> new String[] { log.getAction(), "group" };
        };
        String target = switch (log.getAction()) {
            case "expense.created" -> details.get("title") + " · " + details.get("currency") + " " + details.get("amount");
            case "settlement.paid" -> String.valueOf(details.get("amount"));
            case "group.members_invited" -> details.get("userIds") instanceof List<?> ids
                    ? ids.size() + (ids.size() == 1 ? " person" : " people") : null;
            default -> log.getGroup() == null ? null : log.getGroup().getName();
        };
        return new AuditEntry(
                log.getId(),
                log.getAction(),
                labelAndType[0],
                labelAndType[1],
                log.getUser() == null ? null : UserSummary.from(log.getUser(), userId),
                log.getGroup() == null ? null : log.getGroup().getId(),
                log.getGroup() == null ? null : log.getGroup().getName(),
                target,
                log.getCreatedAt());
    }
}
