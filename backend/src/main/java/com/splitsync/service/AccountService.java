package com.splitsync.service;

import java.util.Map;
import java.util.UUID;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.splitsync.entity.User;
import com.splitsync.entity.UserToken;
import com.splitsync.entity.enums.TokenPurpose;
import com.splitsync.exception.ApiException;
import com.splitsync.exception.ApiExceptions;
import com.splitsync.exception.ErrorCode;
import com.splitsync.repository.UserRepository;
import com.splitsync.service.mail.EmailTemplates;

import lombok.RequiredArgsConstructor;

/** Email-driven account flows: verification, password reset and email change. */
@Service
@RequiredArgsConstructor
public class AccountService {

    private final UserRepository userRepository;
    private final UserTokenService userTokenService;
    private final SessionRevocationService sessionRevocationService;
    private final PasswordEncoder passwordEncoder;
    private final EmailTemplates emailTemplates;
    private final ApplicationEventPublisher events;

    @Transactional
    public void sendVerificationEmail(User user) {
        String token = userTokenService.issue(user, TokenPurpose.EMAIL_VERIFICATION, user.getEmail());
        events.publishEvent(emailTemplates.verifyEmail(user.getEmail(), user.getName(), token));
    }

    @Transactional
    public void resendVerificationEmail(UUID userId) {
        User user = load(userId);
        if (user.isEmailVerified()) {
            throw ApiExceptions.conflict(ErrorCode.EMAIL_ALREADY_VERIFIED, "Your email is already verified");
        }
        sendVerificationEmail(user);
    }

    @Transactional
    public void verifyEmail(String token) {
        UserToken redeemed = userTokenService.redeem(token, TokenPurpose.EMAIL_VERIFICATION);
        User user = redeemed.getUser();
        // A link sent before an email change must not verify the new address.
        if (!user.getEmail().equals(redeemed.getNewEmail())) {
            throw invalidToken();
        }
        user.setEmailVerified(true);
    }

    /** Silent when no account matches, so the endpoint can't be used to discover who has an account. */
    @Transactional
    public void requestPasswordReset(String email) {
        userRepository.findByEmail(UserService.normalizeEmail(email)).ifPresent(user -> {
            String token = userTokenService.issue(user, TokenPurpose.PASSWORD_RESET, user.getEmail());
            events.publishEvent(emailTemplates.passwordReset(user.getEmail(), user.getName(), token));
        });
    }

    /** Opening the emailed link proves the user controls the inbox, so the email also counts as verified. */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = userTokenService.redeem(token, TokenPurpose.PASSWORD_RESET).getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setEmailVerified(true);
        sessionRevocationService.revokeAll(user.getId(), null);
    }

    /**
     * Emails a confirmation link to the new address; the change applies only once it is opened.
     *
     * @param currentPassword required unless the account signs in only with Google or GitHub
     */
    @Transactional
    public void requestEmailChange(UUID userId, String newEmail, String currentPassword) {
        User user = load(userId);
        if (user.getPasswordHash() != null
                && (currentPassword == null || !passwordEncoder.matches(currentPassword, user.getPasswordHash()))) {
            throw ApiExceptions.invalidField("currentPassword", "Current password is incorrect");
        }
        String email = UserService.normalizeEmail(newEmail);
        if (email.equals(user.getEmail())) {
            throw ApiExceptions.invalidField("email", "That's already your email");
        }
        if (userRepository.existsByEmail(email)) {
            throw emailTaken();
        }
        String token = userTokenService.issue(user, TokenPurpose.EMAIL_CHANGE, email);
        events.publishEvent(emailTemplates.confirmEmailChange(email, user.getName(), token));
    }

    /** Applies a confirmed email change and tells the old address about it. */
    @Transactional
    public void confirmEmailChange(String token) {
        UserToken redeemed = userTokenService.redeem(token, TokenPurpose.EMAIL_CHANGE);
        User user = redeemed.getUser();
        String newEmail = redeemed.getNewEmail();
        if (userRepository.existsByEmail(newEmail)) {
            throw emailTaken();
        }
        String oldEmail = user.getEmail();
        user.setEmail(newEmail);
        user.setEmailVerified(true);
        try {
            userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException ex) {
            // Lost a race with a signup for the same address.
            throw emailTaken();
        }
        events.publishEvent(emailTemplates.emailChanged(oldEmail, user.getName(), newEmail));
    }

    private User load(UUID userId) {
        return userRepository.findById(userId).orElseThrow(() -> ApiExceptions.notFound("User"));
    }

    private static ApiException invalidToken() {
        return new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_TOKEN, "This link is invalid or has expired");
    }

    private static ApiException emailTaken() {
        return new ApiException(HttpStatus.CONFLICT, ErrorCode.EMAIL_ALREADY_REGISTERED,
                "An account with this email already exists",
                Map.of("email", "An account with this email already exists"));
    }
}
