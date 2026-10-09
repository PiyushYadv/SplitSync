package com.splitsync;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.JsonNode;

/** One USD group and one EUR group, reported in the user's preferred currency (USD). */
class DashboardAnalyticsIntegrationTest extends IntegrationTestBase {

    private TestUser alice;
    private TestUser bob;
    private UUID usdGroup;
    private UUID eurGroup;

    @BeforeEach
    void setUp() throws Exception {
        when(exchangeRateProvider.fetchRate("EUR", "USD")).thenReturn(new BigDecimal("1.10"));
        alice = signupAndLogin("Alice Dash");
        bob = signupAndLogin("Bob Dash");
        usdGroup = createGroup(alice, "Bali", "USD", bob);
        eurGroup = createGroup(alice, "Paris", "EUR", bob);

        addExpense(alice, usdGroup, "Villa", "100.00", "USD", "Accommodation"); // alice +50 USD
        addExpense(bob, eurGroup, "Dinner", "40.00", "EUR", "Food & Drink");    // alice -20 EUR = -22 USD
        addExpense(bob, usdGroup, "Taxi", "10.00", "USD", "Transport");         // alice -5 USD
    }

    @Test
    void dashboardSummarisesAcrossCurrencies() throws Exception {
        JsonNode dashboard = body(mockMvc.perform(get("/dashboard").cookie(alice.session())).andExpect(status().isOk()));
        JsonNode summary = dashboard.path("summary");

        assertThat(summary.path("currency").asText()).isEqualTo("USD");
        assertThat(summary.path("totalSpend").decimalValue()).isEqualByComparingTo("154.00"); // 110 + 40*1.10
        assertThat(summary.path("youAreOwed").decimalValue()).isEqualByComparingTo("45.00");  // Bali: +50 -5
        assertThat(summary.path("youOwe").decimalValue()).isEqualByComparingTo("22.00");      // Paris: -20 EUR
        assertThat(summary.path("netBalance").decimalValue()).isEqualByComparingTo("23.00");
        assertThat(summary.path("pendingSettlements").asInt()).isEqualTo(2);

        assertThat(dashboard.path("groups")).hasSize(2);
        assertThat(dashboard.path("expenses")).hasSize(3);
        assertThat(dashboard.path("settlements")).hasSize(2);
    }

    @Test
    void analyticsBreaksDownSpendByCategoryAndMonth() throws Exception {
        JsonNode analytics = body(mockMvc.perform(get("/analytics/summary").cookie(alice.session()))
                .andExpect(status().isOk()));

        assertThat(analytics.path("totalSpend").decimalValue()).isEqualByComparingTo("154.00");
        assertThat(analytics.path("yourShare").decimalValue()).isEqualByComparingTo("77.00"); // 50 + 5 + 22
        assertThat(analytics.path("monthlySpend")).hasSize(12);
        String thisMonth = YearMonth.now(ZoneOffset.UTC).toString();
        JsonNode lastMonth = analytics.path("monthlySpend").get(11);
        assertThat(lastMonth.path("month").asText()).isEqualTo(thisMonth);
        assertThat(lastMonth.path("amount").decimalValue()).isEqualByComparingTo("154.00");

        assertThat(analytics.path("largestCategory").path("name").asText()).isEqualTo("Accommodation");
        assertThat(analytics.path("categories")).hasSize(3);
        assertThat(analytics.path("categories").get(1).path("name").asText()).isEqualTo("Food & Drink");
        assertThat(analytics.path("categories").get(1).path("amount").decimalValue()).isEqualByComparingTo("44.00");

        JsonNode audit = analytics.path("audit");
        assertThat(audit.get(0).path("type").asText()).isEqualTo("add");
        assertThat(audit.get(0).path("target").asText()).contains("Taxi");
    }

    @Test
    void analyticsCanBeScopedToOneGroupAndCurrency() throws Exception {
        when(exchangeRateProvider.fetchRate("USD", "EUR")).thenReturn(new BigDecimal("0.90"));
        JsonNode analytics = body(mockMvc.perform(get("/analytics/summary").cookie(alice.session())
                        .param("groupId", usdGroup.toString()).param("currency", "EUR"))
                .andExpect(status().isOk()));
        assertThat(analytics.path("currency").asText()).isEqualTo("EUR");
        assertThat(analytics.path("totalSpend").decimalValue()).isEqualByComparingTo("99.00"); // 110 USD * 0.90

        TestUser outsider = signupAndLogin("Outsider Dash");
        mockMvc.perform(get("/analytics/summary").cookie(outsider.session()).param("groupId", usdGroup.toString()))
                .andExpect(status().isNotFound());
    }
}
