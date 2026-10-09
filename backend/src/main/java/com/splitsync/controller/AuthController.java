package com.splitsync.controller;

import java.time.Instant;

import org.springframework.http.HttpStatus;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.splitsync.dto.auth.ForgotPasswordRequest;
import com.splitsync.dto.auth.LoginRequest;
import com.splitsync.dto.auth.LoginResponse;
import com.splitsync.dto.auth.ResetPasswordRequest;
import com.splitsync.dto.auth.SignupRequest;
import com.splitsync.dto.auth.SignupResponse;
import com.splitsync.dto.auth.TokenRequest;
import com.splitsync.dto.auth.UserResponse;
import com.splitsync.entity.User;
import com.splitsync.security.UserPrincipal;
import com.splitsync.service.AccountService;
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
    private final AccountService accountService;
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;
    private final SecurityContextHolderStrategy securityContextHolderStrategy =
            SecurityContextHolder.getContextHolderStrategy();

    /** New accounts can sign in right away; the verification email is a nudge, not a gate. */
    @PostMapping("/signup")
    public SignupResponse signup(@Valid @RequestBody SignupRequest request) {
        User user = userService.register(request);
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

    /** Always 204, whether or not an account exists for the email. */
    @PostMapping("/forgot-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        accountService.requestPasswordReset(request.email());
    }

    /** Also signs the account out of every session. */
    @PostMapping("/reset-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        accountService.resetPassword(request.token(), request.password());
    }

    @PostMapping("/verify-email")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void verifyEmail(@Valid @RequestBody TokenRequest request) {
        accountService.verifyEmail(request.token());
    }

    @PostMapping("/verify-email/resend")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resendVerification(@AuthenticationPrincipal UserPrincipal principal) {
        accountService.resendVerificationEmail(principal.getId());
    }

    /** Public: the link may be opened in a browser where the user isn't signed in. */
    @PostMapping("/confirm-email-change")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void confirmEmailChange(@Valid @RequestBody TokenRequest request) {
        accountService.confirmEmailChange(request.token());
    }
}
