package com.splitsync.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.session.web.http.CookieSerializer;
import org.springframework.session.web.http.DefaultCookieSerializer;

/**
 * Spring Session Redis is auto-configured from {@code spring.session.*} in application.yml
 * (indexed repository, 7-day timeout). This class only customises the session cookie.
 */
@Configuration
public class SessionConfig {

    @Bean
    public CookieSerializer cookieSerializer(AppProperties appProperties) {
        AppProperties.Session session = appProperties.session();
        DefaultCookieSerializer serializer = new DefaultCookieSerializer();
        serializer.setCookieName(session.cookieName());
        serializer.setCookiePath("/");
        serializer.setUseHttpOnlyCookie(true);
        serializer.setSameSite(session.cookieSameSite());
        serializer.setUseSecureCookie(session.cookieSecure());
        // Keep the raw session id in the cookie so it is easy to forward from Next.js server components.
        serializer.setUseBase64Encoding(false);
        return serializer;
    }
}
