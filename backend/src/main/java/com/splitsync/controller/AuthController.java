package com.splitsync.controller;

import java.time.Instant;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolderStrategy;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.splitsync.dto.auth.LoginRequest;
import com.splitsync.dto.auth.LoginResponse;
import com.splitsync.dto.auth.SignupRequest;
import com.splitsync.dto.auth.SignupResponse;
import com.splitsync.dto.auth.UserResponse;
import com.splitsync.entity.User;
import com.splitsync.security.UserPrincipal;
import com.splitsync.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/** Logout is handled by Spring Security's LogoutFilter (see SecurityConfig). */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;
    private final SecurityContextHolderStrategy securityContextHolderStrategy =
            SecurityContextHolder.getContextHolderStrategy();

    @PostMapping("/signup")
    public SignupResponse signup(@Valid @RequestBody SignupRequest request) {
        User user = userService.register(request);
        // Email verification is not wired up yet, so new accounts can log in immediately.
        return new SignupResponse(user.getId(), false);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        Authentication authentication = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(
                        UserService.normalizeEmail(request.email()), request.password()));

        // Rotate the session id on login to prevent session fixation.
        if (httpRequest.getSession(false) != null) {
            httpRequest.changeSessionId();
        }

        SecurityContext context = securityContextHolderStrategy.createEmptyContext();
        context.setAuthentication(authentication);
        securityContextHolderStrategy.setContext(context);
        securityContextRepository.saveContext(context, httpRequest, httpResponse);

        HttpSession session = httpRequest.getSession();
        Instant expiresAt = Instant.now().plusSeconds(session.getMaxInactiveInterval());

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return new LoginResponse(UserResponse.from(userService.getById(principal.getId())), expiresAt);
    }

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal UserPrincipal principal) {
        return UserResponse.from(userService.getById(principal.getId()));
    }
}
