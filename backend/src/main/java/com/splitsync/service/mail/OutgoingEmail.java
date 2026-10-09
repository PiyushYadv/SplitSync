package com.splitsync.service.mail;

/** A message to send once the surrounding transaction commits. */
public record OutgoingEmail(String to, String subject, String text, String html) {
}
