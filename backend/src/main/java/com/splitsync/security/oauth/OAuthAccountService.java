package com.splitsync.security.oauth;

import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.splitsync.entity.User;
import com.splitsync.entity.UserIdentity;
import com.splitsync.repository.UserIdentityRepository;
import com.splitsync.repository.UserRepository;
import com.splitsync.service.SessionRevocationService;
import com.splitsync.service.UserService;

import lombok.RequiredArgsConstructor;

/** Finds, links or creates the SplitSync user behind a Google or GitHub sign-in. */
@Service
@RequiredArgsConstructor
public class OAuthAccountService {

    private final UserIdentityRepository userIdentityRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final SessionRevocationService sessionRevocationService;

    @Transactional
    public User signIn(ExternalProfile profile) {
        UserIdentity.Key key = new UserIdentity.Key(profile.provider(), profile.subject());
        var linked = userIdentityRepository.findById(key);
        if (linked.isPresent()) {
            // The identity's user is a lazy proxy; load it here, because the caller reads it after this
            // transaction (and its persistence context) has closed.
            return Hibernate.unproxy(linked.get().getUser(), User.class);
        }

        // Matching accounts by email is only safe when the provider has verified that address.
        if (profile.email() == null || !profile.emailVerified()) {
            throw SplitSyncOAuth2UserService.error(SplitSyncOAuth2UserService.EMAIL_NOT_VERIFIED);
        }

        String email = UserService.normalizeEmail(profile.email());
        User user = userRepository.findByEmail(email)
                .map(this::claimExisting)
                .orElseGet(() -> userService.registerExternal(profile.name(), email, profile.avatarUrl()));
        userIdentityRepository.save(new UserIdentity(profile.provider(), profile.subject(), user));
        return user;
    }

    /**
     * Links a provider account to an existing user with the same email. If that user never verified the address,
     * someone else may have registered it first, so their password and sessions are dropped: the provider has
     * just proven who owns the inbox.
     */
    private User claimExisting(User user) {
        if (!user.isEmailVerified()) {
            user.setPasswordHash(null);
            user.setEmailVerified(true);
            sessionRevocationService.revokeAll(user.getId(), null);
        }
        return user;
    }
}
