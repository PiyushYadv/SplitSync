package com.splitsync.security;

import java.io.Serial;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.core.CredentialsContainer;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import com.splitsync.entity.User;

/**
 * Authenticated user stored in the Redis-backed session, for both password and Google/GitHub sign-in. Holds only
 * the id; profile data is re-read from the database so it never goes stale. The password hash is erased after
 * authentication.
 *
 * <p>The principal name is the user id, not the email, so Spring Session's per-user session index survives an
 * email change (see SessionRevocationService).
 */
public final class UserPrincipal implements UserDetails, OAuth2User, CredentialsContainer {

    @Serial
    private static final long serialVersionUID = 2L;

    private static final List<GrantedAuthority> AUTHORITIES = List.of(new SimpleGrantedAuthority("ROLE_USER"));

    private final UUID id;
    private String passwordHash;

    private UserPrincipal(UUID id, String passwordHash) {
        this.id = id;
        this.passwordHash = passwordHash;
    }

    public static UserPrincipal from(User user) {
        return new UserPrincipal(user.getId(), user.getPasswordHash());
    }

    public UUID getId() {
        return id;
    }

    @Override
    public String getName() {
        return id.toString();
    }

    @Override
    public String getUsername() {
        return id.toString();
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    /** Provider attributes are only needed while signing in, so none are kept in the session. */
    @Override
    public Map<String, Object> getAttributes() {
        return Map.of();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return AUTHORITIES;
    }

    @Override
    public void eraseCredentials() {
        passwordHash = null;
    }
}
