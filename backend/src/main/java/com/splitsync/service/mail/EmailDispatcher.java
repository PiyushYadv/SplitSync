package com.splitsync.service.mail;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Sends queued emails after the transaction that queued them commits, off the request thread: a slow or
 * unreachable SMTP server never fails the request, and a rolled-back change never sends a link.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class EmailDispatcher {

    private final EmailSender emailSender;

    @Async
    @TransactionalEventListener(fallbackExecution = true)
    public void dispatch(OutgoingEmail email) {
        try {
            emailSender.send(email);
        } catch (RuntimeException ex) {
            log.error("Failed to send \"{}\" email to {}", email.subject(), email.to(), ex);
        }
    }
}
