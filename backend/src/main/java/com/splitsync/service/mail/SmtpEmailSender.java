package com.splitsync.service.mail;

import java.nio.charset.StandardCharsets;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import com.splitsync.config.AppProperties;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class SmtpEmailSender implements EmailSender {

    private final JavaMailSender mailSender;
    private final AppProperties appProperties;

    @Override
    public void send(OutgoingEmail email) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(appProperties.mail().from());
            helper.setTo(email.to());
            helper.setSubject(email.subject());
            helper.setText(email.text(), email.html());
            mailSender.send(message);
        } catch (MessagingException ex) {
            throw new IllegalStateException("Could not build email to " + email.to(), ex);
        }
    }
}
