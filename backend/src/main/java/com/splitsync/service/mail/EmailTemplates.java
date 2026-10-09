package com.splitsync.service.mail;

import org.springframework.stereotype.Component;
import org.springframework.web.util.HtmlUtils;
import org.springframework.web.util.UriComponentsBuilder;

import com.splitsync.config.AppProperties;

import lombok.RequiredArgsConstructor;

/** Builds the transactional emails. Every link points at a frontend page that calls the API. */
@Component
@RequiredArgsConstructor
public class EmailTemplates {

    private final AppProperties appProperties;

    public OutgoingEmail verifyEmail(String to, String name, String token) {
        return withAction(to, name, "Verify your SplitSync email",
                "Confirm this is your email address so we can reach you about your account.",
                "Verify email", link("/verify-email", token),
                "This link expires in 24 hours. If you didn't create a SplitSync account, ignore this email.");
    }

    public OutgoingEmail passwordReset(String to, String name, String token) {
        return withAction(to, name, "Reset your SplitSync password",
                "We received a request to reset your password.",
                "Reset password", link("/reset-password", token),
                "This link expires in 30 minutes. If you didn't ask to reset your password, ignore this email;"
                        + " your password won't change.");
    }

    public OutgoingEmail confirmEmailChange(String to, String name, String token) {
        return withAction(to, name, "Confirm your new SplitSync email",
                "Confirm that you want to use this address for your SplitSync account.",
                "Confirm new email", link("/confirm-email", token),
                "This link expires in 24 hours. If you didn't ask for this change, ignore this email.");
    }

    public OutgoingEmail emailChanged(String to, String name, String newEmail) {
        String body = "The email address on your SplitSync account was changed to " + newEmail + ".";
        String footer = "If you didn't make this change, reset your password right away.";
        String text = greeting(name) + "\n\n" + body + "\n\n" + footer + "\n";
        String html = layout(name, "<p>" + escape(body) + "</p>", footer);
        return new OutgoingEmail(to, "Your SplitSync email was changed", text, html);
    }

    private OutgoingEmail withAction(String to, String name, String subject, String intro, String action,
            String url, String footer) {
        String text = greeting(name) + "\n\n" + intro + "\n\n" + action + ": " + url + "\n\n" + footer + "\n";
        String html = layout(name, "<p>" + escape(intro) + "</p>"
                + "<p style=\"margin:24px 0\"><a href=\"" + escape(url) + "\" style=\"background:#4f46e5;color:#fff;"
                + "padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600\">" + escape(action)
                + "</a></p><p style=\"color:#64748b;font-size:13px\">Or open this link: " + escape(url) + "</p>",
                footer);
        return new OutgoingEmail(to, subject, text, html);
    }

    private String link(String path, String token) {
        return UriComponentsBuilder.fromUriString(appProperties.frontendUrl())
                .path(path)
                .queryParam("token", token)
                .build()
                .toUriString();
    }

    private static String greeting(String name) {
        return "Hi " + name + ",";
    }

    private static String layout(String name, String body, String footer) {
        return "<div style=\"font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;"
                + "color:#0f172a;font-size:15px;line-height:1.5\">"
                + "<p style=\"font-weight:700;color:#4f46e5\">SplitSync</p>"
                + "<p>" + escape(greeting(name)) + "</p>" + body
                + "<p style=\"color:#94a3b8;font-size:12px;margin-top:32px\">" + escape(footer) + "</p></div>";
    }

    private static String escape(String value) {
        return HtmlUtils.htmlEscape(value);
    }
}
