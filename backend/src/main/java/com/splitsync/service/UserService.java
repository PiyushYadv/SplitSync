package com.splitsync.service;

import java.security.SecureRandom;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.splitsync.dto.auth.SignupRequest;
import com.splitsync.entity.User;
import com.splitsync.entity.UserSettings;
import com.splitsync.exception.ApiException;
import com.splitsync.exception.ErrorCode;
import com.splitsync.repository.UserRepository;
import com.splitsync.repository.UserSettingsRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final int MAX_USERNAME_BASE_LENGTH = 30;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User register(SignupRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmail(email)) {
            throw emailTaken();
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setUsername(generateUsername(email));
        user.setPasswordHash(passwordEncoder.encode(request.password()));

        try {
            user = userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException ex) {
            // Lost a race with a concurrent signup for the same email.
            throw emailTaken();
        }
        userSettingsRepository.save(new UserSettings(user));
        return user;
    }

    @Transactional(readOnly = true)
    public User getById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED,
                        "Authentication required"));
    }

    public static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String generateUsername(String email) {
        String base = email.substring(0, email.indexOf('@'))
                .replaceAll("[^a-z0-9._]", "")
                .replaceAll("^[._]+|[._]+$", "");
        if (base.isEmpty()) {
            base = "user";
        }
        if (base.length() > MAX_USERNAME_BASE_LENGTH) {
            base = base.substring(0, MAX_USERNAME_BASE_LENGTH);
        }

        String candidate = base;
        while (userRepository.existsByUsername(candidate)) {
            candidate = base + (1000 + RANDOM.nextInt(9000));
        }
        return candidate;
    }

    private static ApiException emailTaken() {
        return new ApiException(HttpStatus.CONFLICT, ErrorCode.EMAIL_ALREADY_REGISTERED,
                "An account with this email already exists",
                Map.of("email", "An account with this email already exists"));
    }
}
