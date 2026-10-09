package com.splitsync;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.cache.CacheManager;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.splitsync.service.fx.ExchangeRateProvider;
import com.splitsync.service.fx.ExchangeRateService;
import com.splitsync.service.mail.EmailSender;
import com.splitsync.service.mail.OutgoingEmail;
import com.splitsync.service.receipt.ReceiptScanner;

import jakarta.servlet.http.Cookie;

/**
 * Starts Postgres and Redis once for the whole test run; every integration test class shares them and the
 * Spring context. The external FX API, SMTP and the receipt scanner are replaced with mocks.
 */
@SpringBootTest(properties = {
        // Every test logs in from 127.0.0.1, so keep the per-IP auth limits out of the way.
        "app.rate-limit.login.capacity=100000",
        "app.rate-limit.signup.capacity=100000",
        "app.rate-limit.email.capacity=100000",
        // Small enough that a test can exhaust it.
        "app.rate-limit.user-search.capacity=5",
        "app.rate-limit.user-search.refill-per-minute=1" })
@AutoConfigureMockMvc
public abstract class IntegrationTestBase {

    protected static final String SESSION_COOKIE = "splitsync_session";

    @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

    @ServiceConnection(name = "redis")
    static final GenericContainer<?> REDIS = new GenericContainer<>("redis:7-alpine").withExposedPorts(6379);

    static {
        POSTGRES.start();
        REDIS.start();
    }

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @MockBean
    protected ExchangeRateProvider exchangeRateProvider;

    /** Captures outgoing email instead of talking to SMTP. */
    @MockBean
    protected EmailSender emailSender;

    @MockBean
    protected ReceiptScanner receiptScanner;

    @Autowired
    private CacheManager cacheManager;

    @BeforeEach
    void clearExchangeRateCache() {
        // Each test stubs its own rates; don't let a rate cached in Redis by an earlier test leak in.
        cacheManager.getCache(ExchangeRateService.CACHE_NAME).clear();
    }

    protected record TestUser(UUID id, String name, Cookie session) {
    }

    /** Signs up a user with a unique email and returns their logged-in session. */
    protected TestUser signupAndLogin(String name) throws Exception {
        String email = name.toLowerCase().replace(' ', '.') + "." + UUID.randomUUID().toString().substring(0, 8)
                + "@example.com";
        mockMvc.perform(post("/auth/signup").contentType(MediaType.APPLICATION_JSON)
                        .content(json("name", name, "email", email, "password", "password123")))
                .andExpect(status().isOk());
        var login = mockMvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(json("email", email, "password", "password123")))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode body = objectMapper.readTree(login.getResponse().getContentAsString());
        return new TestUser(UUID.fromString(body.path("user").path("id").asText()), name,
                login.getResponse().getCookie(SESSION_COOKIE));
    }

    /** Creates a group owned by {@code owner}; every other user is invited and accepts. Returns the group id. */
    protected UUID createGroup(TestUser owner, String name, String baseCurrency, TestUser... members) throws Exception {
        JsonNode group = body(mockMvc.perform(post("/groups").cookie(owner.session())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("name", name, "emoji", "🌍", "color", "indigo", "baseCurrency", baseCurrency,
                                "memberIds", java.util.Arrays.stream(members).map(TestUser::id).toList())))
                .andExpect(status().isCreated()));
        UUID groupId = UUID.fromString(group.path("id").asText());
        for (TestUser member : members) {
            JsonNode invitations = body(mockMvc.perform(get("/invitations").cookie(member.session()))
                    .andExpect(status().isOk()));
            for (JsonNode invitation : invitations.path("data")) {
                if (invitation.path("groupId").asText().equals(groupId.toString())) {
                    mockMvc.perform(post("/invitations/{id}/accept", invitation.path("id").asText())
                                    .cookie(member.session()))
                            .andExpect(status().isOk());
                }
            }
        }
        return groupId;
    }

    /** Adds an expense split equally between all current members. */
    protected JsonNode addExpense(TestUser payer, UUID groupId, String title, String amount, String currency,
            String category) throws Exception {
        return body(mockMvc.perform(post("/expenses").cookie(payer.session())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("groupId", groupId, "title", title, "amount", amount, "currency", currency,
                                "paidByUserId", payer.id(), "category", category)))
                .andExpect(status().isCreated()));
    }

    /** Waits for the asynchronously sent email to {@code to} whose subject contains {@code subject}. */
    protected OutgoingEmail awaitEmail(String to, String subject) throws InterruptedException {
        for (int attempt = 0; attempt < 50; attempt++) {
            var match = org.mockito.Mockito.mockingDetails(emailSender).getInvocations().stream()
                    .map(invocation -> (OutgoingEmail) invocation.getArgument(0))
                    .filter(email -> email.to().equals(to) && email.subject().contains(subject))
                    .reduce((first, second) -> second);
            if (match.isPresent()) {
                return match.get();
            }
            Thread.sleep(100);
        }
        throw new AssertionError("No \"" + subject + "\" email sent to " + to);
    }

    /** The token from the link in an email. */
    protected static String tokenIn(OutgoingEmail email) {
        var matcher = java.util.regex.Pattern.compile("token=([A-Za-z0-9_-]+)").matcher(email.text());
        if (!matcher.find()) {
            throw new AssertionError("No link in email: " + email.text());
        }
        return matcher.group(1);
    }

    protected String json(Object... keyValues) throws Exception {
        var map = new java.util.LinkedHashMap<String, Object>();
        for (int i = 0; i < keyValues.length; i += 2) {
            map.put((String) keyValues[i], keyValues[i + 1]);
        }
        return objectMapper.writeValueAsString(map);
    }

    protected JsonNode body(org.springframework.test.web.servlet.ResultActions result) throws Exception {
        return objectMapper.readTree(result.andReturn().getResponse().getContentAsString());
    }
}
