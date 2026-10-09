package com.splitsync.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.util.UriComponentsBuilder;

import com.splitsync.security.JsonSecurityErrorHandler;
import com.splitsync.security.oauth.NoOpAuthorizedClientRepository;
import com.splitsync.security.oauth.OAuthRegistrations;
import com.splitsync.security.oauth.SplitSyncOAuth2UserService;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
            SecurityContextRepository securityContextRepository,
            JsonSecurityErrorHandler jsonSecurityErrorHandler,
            OAuthRegistrations oauthRegistrations,
            SplitSyncOAuth2UserService oauth2UserService,
            AppProperties appProperties) throws Exception {
        http
                .cors(Customizer.withDefaults())
                // JSON-only API: cross-site form posts can't send application/json without a CORS preflight,
                // and the session cookie is SameSite=Lax.
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                // Don't create a session just to remember a rejected request; there is no login page to return to.
                .requestCache(AbstractHttpConfigurer::disable)
                .securityContext(context -> context.securityContextRepository(securityContextRepository))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/auth/signup", "/auth/login", "/auth/logout",
                                "/auth/forgot-password", "/auth/reset-password", "/auth/verify-email",
                                "/auth/confirm-email-change").permitAll()
                        .requestMatchers(HttpMethod.GET, "/config").permitAll()
                        .requestMatchers("/error").permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(jsonSecurityErrorHandler)
                        .accessDeniedHandler(jsonSecurityErrorHandler))
                // Invalidating the session makes Spring Session expire the splitsync_session cookie.
                .logout(logout -> logout
                        .logoutRequestMatcher(new AntPathRequestMatcher("/auth/logout", HttpMethod.POST.name()))
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler(HttpStatus.NO_CONTENT)));

        if (!oauthRegistrations.all().isEmpty()) {
            configureOAuthLogin(http, oauthRegistrations, oauth2UserService, appProperties.frontendUrl());
        }
        return http.build();
    }

    /**
     * Google/GitHub sign-in is a full-page redirect flow: the browser opens {@code /api/auth/oauth/<provider>},
     * the provider calls back to {@code /api/auth/oauth/callback/<provider>}, and the backend sets the session
     * cookie and sends the browser to the frontend.
     */
    private static void configureOAuthLogin(HttpSecurity http, OAuthRegistrations registrations,
            SplitSyncOAuth2UserService userService, String frontendUrl) throws Exception {
        http.oauth2Login(oauth -> oauth
                .clientRegistrationRepository(new InMemoryClientRegistrationRepository(registrations.all()))
                .authorizedClientRepository(new NoOpAuthorizedClientRepository())
                .authorizationEndpoint(endpoint -> endpoint.baseUri(OAuthRegistrations.AUTHORIZATION_BASE_URI))
                .redirectionEndpoint(endpoint -> endpoint.baseUri(OAuthRegistrations.CALLBACK_BASE_URI + "/*"))
                .userInfoEndpoint(userInfo -> userInfo.userService(userService))
                // Also stops Spring Security from generating its own HTML login page.
                .loginPage(frontendUrl + "/login")
                .successHandler((request, response, authentication) ->
                        response.sendRedirect(frontendUrl + "/dashboard"))
                .failureHandler((request, response, exception) -> {
                    String code = exception instanceof OAuth2AuthenticationException oauthException
                            ? oauthException.getError().getErrorCode()
                            : "oauth_failed";
                    response.sendRedirect(UriComponentsBuilder.fromUriString(frontendUrl).path("/login")
                            .queryParam("error", code).build().encode().toUriString());
                }));
    }

    @Bean
    public SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(UserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(provider);
    }
}
