package com.splitsync.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.splitsync.entity.User;
import com.splitsync.entity.UserToken;
import com.splitsync.entity.enums.TokenPurpose;
import com.splitsync.exception.ApiException;
import com.splitsync.exception.ErrorCode;
import com.splitsync.repository.UserTokenRepository;

import lombok.RequiredArgsConstructor;

/**
 * Issues and redeems the single-use tokens behind emailed links. Tokens are 256 random bits; only their SHA-256
 * hash is stored, so a database leak doesn't expose working links.
 */
@Service
@RequiredArgsConstructor
public class UserTokenService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserTokenRepository userTokenRepository;

    /**
     * Issues a token and retires the user's earlier tokens of the same purpose.
     *
     * @param email the address the token confirms: the current one, or the new one for an email change
     * @return the raw token to put in the link
     */
    @Transactional
    public String issue(User user, TokenPurpose purpose, String email) {
        Instant now = Instant.now();
        userTokenRepository.invalidateOutstanding(user.getId(), purpose, now);

        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        String raw = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        UserToken token = new UserToken();
        token.setUser(user);
        token.setPurpose(purpose);
        token.setTokenHash(hash(raw));
        token.setNewEmail(email);
        token.setExpiresAt(now.plus(purpose.lifetime()));
        userTokenRepository.save(token);
        return raw;
    }

    /** Marks the token used and returns it. Unknown, used and expired tokens are rejected alike. */
    @Transactional
    public UserToken redeem(String raw, TokenPurpose purpose) {
        Instant now = Instant.now();
        UserToken token = userTokenRepository.findByTokenHashAndPurpose(hash(raw), purpose)
                .filter(t -> t.isUsable(now))
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_TOKEN,
                        "This link is invalid or has expired"));
        token.setUsedAt(now);
        return token;
    }

    private static String hash(String raw) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(raw.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException(ex);
        }
    }
}
