package com.splitsync;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import com.fasterxml.jackson.databind.JsonNode;

/** Groups → invitations → expenses → optimized settlements → payment, through the real HTTP API. */
class LedgerIntegrationTest extends IntegrationTestBase {

    private TestUser alice;
    private TestUser bob;
    private TestUser carol;
    private UUID groupId;

    @BeforeEach
    void setUpGroupOfThree() throws Exception {
        alice = signupAndLogin("Alice Chen");
        bob = signupAndLogin("Bob Tanaka");
        carol = signupAndLogin("Carol Roy");

        JsonNode group = body(mockMvc.perform(post("/groups").cookie(alice.session())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("name", "Trip to Bali", "emoji", "🌴", "color", "emerald",
                                "baseCurrency", "USD", "memberIds", List.of(bob.id(), carol.id()))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.members.length()").value(1))
                .andExpect(jsonPath("$.members[0].role").value("owner")));
        groupId = UUID.fromString(group.path("id").asText());

        for (TestUser invitee : List.of(bob, carol)) {
            JsonNode invitations = body(mockMvc.perform(get("/invitations").cookie(invitee.session()))
                    .andExpect(status().isOk()));
            assertThat(invitations.path("data")).hasSize(1);
            String invitationId = invitations.path("data").get(0).path("id").asText();
            mockMvc.perform(post("/invitations/{id}/accept", invitationId).cookie(invitee.session()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("accepted"));
        }
    }

    @Test
    void equalSplitProducesOptimizedSettlementsAndPaymentClearsDebt() throws Exception {
        createExpense(alice, Map.of("title", "Villa", "amount", "90.00", "currency", "USD",
                "paidByUserId", alice.id()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.amount").value(90.00))
                .andExpect(jsonPath("$.splits.length()").value(3));

        JsonNode detail = groupDetail(alice);
        assertThat(balanceOf(detail, alice.id())).isEqualByComparingTo("60.00");
        assertThat(balanceOf(detail, bob.id())).isEqualByComparingTo("-30.00");
        assertThat(balanceOf(detail, carol.id())).isEqualByComparingTo("-30.00");
        assertThat(detail.path("status").asText()).isEqualTo("active");

        JsonNode pending = body(mockMvc.perform(get("/settlements").param("groupId", groupId.toString())
                        .param("status", "pending").cookie(bob.session()))
                .andExpect(status().isOk()));
        assertThat(pending.path("data")).hasSize(2);
        JsonNode bobsDebt = findSettlement(pending, bob.id(), alice.id());
        assertThat(bobsDebt.path("amount").decimalValue()).isEqualByComparingTo("30.00");

        // Pay twice with the same Idempotency-Key, then once more without: always the same paid settlement.
        String settlementId = bobsDebt.path("id").asText();
        for (int i = 0; i < 2; i++) {
            mockMvc.perform(post("/settlements/{id}/pay", settlementId).cookie(bob.session())
                            .header("Idempotency-Key", "pay-1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("paid"))
                    .andExpect(jsonPath("$.paid").value(true));
        }
        mockMvc.perform(post("/settlements/{id}/pay", settlementId).cookie(alice.session()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("paid"));

        detail = groupDetail(alice);
        assertThat(balanceOf(detail, alice.id())).isEqualByComparingTo("30.00");
        assertThat(balanceOf(detail, bob.id())).isEqualByComparingTo("0.00");

        // Carol can't mark Bob's settlement as paid.
        JsonNode carolsDebt = findSettlement(body(mockMvc.perform(get("/settlements")
                .param("status", "pending").cookie(carol.session()))), carol.id(), alice.id());
        mockMvc.perform(post("/settlements/{id}/pay", carolsDebt.path("id").asText()).cookie(bob.session()))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/settlements/{id}/pay", carolsDebt.path("id").asText()).cookie(carol.session()))
                .andExpect(status().isOk());
        assertThat(groupDetail(alice).path("status").asText()).isEqualTo("settled");
    }

    @Test
    void foreignCurrencyIsConvertedOnceAndSplitsSumToBaseAmount() throws Exception {
        when(exchangeRateProvider.fetchRate(eq("EUR"), eq("USD"))).thenReturn(new BigDecimal("1.0837"));

        JsonNode expense = body(createExpense(bob, Map.of("title", "Dinner", "amount", "100.00", "currency", "eur",
                "paidByUserId", bob.id(), "splitType", "percentage", "splits", List.of(
                        Map.of("userId", alice.id(), "percentage", "33.33"),
                        Map.of("userId", bob.id(), "percentage", "33.33"),
                        Map.of("userId", carol.id(), "percentage", "33.34"))))
                .andExpect(status().isCreated()));

        assertThat(expense.path("originalAmount").decimalValue()).isEqualByComparingTo("100.00");
        assertThat(expense.path("originalCurrency").asText()).isEqualTo("EUR");
        assertThat(expense.path("currency").asText()).isEqualTo("USD");
        assertThat(expense.path("amount").decimalValue()).isEqualByComparingTo("108.37");
        BigDecimal splitTotal = BigDecimal.ZERO;
        for (JsonNode split : expense.path("splits")) {
            splitTotal = splitTotal.add(split.path("amount").decimalValue());
        }
        assertThat(splitTotal).isEqualByComparingTo("108.37");

        JsonNode detail = groupDetail(carol);
        BigDecimal netSum = BigDecimal.ZERO;
        for (JsonNode member : detail.path("members")) {
            netSum = netSum.add(member.path("balance").decimalValue());
        }
        assertThat(netSum).isEqualByComparingTo("0");
    }

    @Test
    void idempotencyKeyPreventsDuplicateExpenses() throws Exception {
        Map<String, Object> request = Map.of("title", "Taxi", "amount", "12.50", "currency", "USD",
                "paidByUserId", carol.id());
        String first = body(createExpense(carol, request, "taxi-1").andExpect(status().isCreated())).path("id").asText();
        String second = body(createExpense(carol, request, "taxi-1").andExpect(status().isCreated())).path("id").asText();
        assertThat(second).isEqualTo(first);

        createExpense(carol, Map.of("title", "Taxi", "amount", "99.00", "currency", "USD",
                "paidByUserId", carol.id()), "taxi-1")
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value("IDEMPOTENCY_KEY_REUSED"));

        mockMvc.perform(get("/expenses").param("groupId", groupId.toString()).cookie(alice.session()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1));
    }

    @Test
    void expenseListIsCursorPaginated() throws Exception {
        for (int i = 1; i <= 3; i++) {
            createExpense(alice, Map.of("title", "Expense " + i, "amount", "10.00", "currency", "USD",
                    "paidByUserId", alice.id(), "occurredAt", "2026-09-0" + i + "T10:00:00.000Z"))
                    .andExpect(status().isCreated());
        }

        List<String> titles = new ArrayList<>();
        String cursor = null;
        do {
            var request = get("/expenses").param("groupId", groupId.toString()).param("limit", "2")
                    .cookie(alice.session());
            if (cursor != null) {
                request.param("cursor", cursor);
            }
            JsonNode page = body(mockMvc.perform(request).andExpect(status().isOk()));
            assertThat(page.path("total").asInt()).isEqualTo(3);
            page.path("data").forEach(e -> titles.add(e.path("title").asText()));
            cursor = page.path("nextCursor").isNull() || page.path("nextCursor").isMissingNode()
                    ? null : page.path("nextCursor").asText();
        } while (cursor != null);

        assertThat(titles).containsExactly("Expense 3", "Expense 2", "Expense 1");
    }

    @Test
    void rejectsInvalidSplitsAndNonMembers() throws Exception {
        createExpense(alice, Map.of("title", "Hotel", "amount", "100.00", "currency", "USD",
                "paidByUserId", alice.id(), "splitType", "exact", "splits", List.of(
                        Map.of("userId", alice.id(), "amount", "60.00"),
                        Map.of("userId", bob.id(), "amount", "30.00"))))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.fieldErrors.splits").exists());

        TestUser outsider = signupAndLogin("Mallory");
        mockMvc.perform(get("/groups/{id}", groupId).cookie(outsider.session()))
                .andExpect(status().isNotFound());
        createExpense(outsider, Map.of("title", "Sneaky", "amount", "1.00", "currency", "USD",
                "paidByUserId", outsider.id()))
                .andExpect(status().isNotFound());
        createExpense(alice, Map.of("title", "Sneaky", "amount", "1.00", "currency", "USD",
                "paidByUserId", outsider.id()))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.fieldErrors.paidByUserId").exists());
    }

    @Test
    void cannotLeaveWithOutstandingBalanceButCanOnceSettled() throws Exception {
        createExpense(alice, Map.of("title", "Groceries", "amount", "30.00", "currency", "USD",
                "paidByUserId", alice.id(), "splits", List.of(
                        Map.of("userId", alice.id()), Map.of("userId", bob.id()))))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/groups/{id}/leave", groupId).cookie(bob.session()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("OUTSTANDING_BALANCE"));

        // Carol was not part of that expense, so she can leave.
        mockMvc.perform(post("/groups/{id}/leave", groupId).cookie(carol.session()))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/groups/{id}", groupId).cookie(carol.session()))
                .andExpect(status().isNotFound());

        JsonNode groups = body(mockMvc.perform(get("/groups").cookie(alice.session())).andExpect(status().isOk()));
        assertThat(groups.path("data").get(0).path("memberCount").asInt()).isEqualTo(2);
        assertThat(groups.path("data").get(0).path("balance").decimalValue()).isEqualByComparingTo("15.00");
        assertThat(groups.path("data").get(0).path("totalSpend").decimalValue()).isEqualByComparingTo("30.00");
    }

    private org.springframework.test.web.servlet.ResultActions createExpense(TestUser user, Map<String, Object> fields)
            throws Exception {
        return createExpense(user, fields, null);
    }

    private org.springframework.test.web.servlet.ResultActions createExpense(TestUser user, Map<String, Object> fields,
            String idempotencyKey) throws Exception {
        var body = new java.util.LinkedHashMap<String, Object>(fields);
        body.put("groupId", groupId);
        var request = post("/expenses").cookie(user.session()).contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body));
        if (idempotencyKey != null) {
            request.header("Idempotency-Key", idempotencyKey);
        }
        return mockMvc.perform(request);
    }

    private JsonNode groupDetail(TestUser user) throws Exception {
        return body(mockMvc.perform(get("/groups/{id}", groupId).cookie(user.session())).andExpect(status().isOk()));
    }

    private static BigDecimal balanceOf(JsonNode detail, UUID userId) {
        for (JsonNode member : detail.path("members")) {
            if (member.path("id").asText().equals(userId.toString())) {
                return member.path("balance").decimalValue();
            }
        }
        throw new AssertionError("No member " + userId);
    }

    private static JsonNode findSettlement(JsonNode list, UUID from, UUID to) {
        for (JsonNode s : list.path("data")) {
            if (s.path("fromUserId").asText().equals(from.toString()) && s.path("toUserId").asText().equals(to.toString())) {
                return s;
            }
        }
        throw new AssertionError("No settlement " + from + " -> " + to + " in " + list);
    }
}
