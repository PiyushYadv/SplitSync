package com.splitsync.controller;

import java.time.Instant;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.splitsync.dto.common.ListResponse;
import com.splitsync.dto.expense.CreateExpenseRequest;
import com.splitsync.dto.expense.ExpenseResponse;
import com.splitsync.security.UserPrincipal;
import com.splitsync.service.ExpenseLedgerService;
import com.splitsync.service.ExpenseLedgerService.ExpenseFilter;
import com.splitsync.service.IdempotencyService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseLedgerService expenseLedgerService;
    private final IdempotencyService idempotencyService;

    @GetMapping
    public ListResponse<ExpenseResponse> list(@AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) UUID groupId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(required = false) String cursor,
            @RequestParam(required = false) Integer limit) {
        return expenseLedgerService.list(principal.getId(),
                new ExpenseFilter(groupId, category, from, to, cursor, limit));
    }

    @GetMapping("/{id}")
    public ExpenseResponse get(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id) {
        return expenseLedgerService.get(id, principal.getId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ExpenseResponse create(@AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody CreateExpenseRequest request) {
        UUID userId = principal.getId();
        return idempotencyService.execute(idempotencyKey, userId, "expense.create", request,
                () -> expenseLedgerService.create(userId, request),
                ExpenseResponse::id,
                expenseId -> expenseLedgerService.get(expenseId, userId));
    }
}
