package com.tripwise.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.email.from}")
    private String fromAddress;

    @Async
    public void sendVerificationCode(String toEmail, String code, String purpose) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromAddress);
            helper.setTo(toEmail);

            if ("signup".equals(purpose)) {
                helper.setSubject("TripWise — Verify your email");
                helper.setText(buildSignupEmailHtml(code), true);
            } else {
                helper.setSubject("TripWise — Reset your password");
                helper.setText(buildResetEmailHtml(code), true);
            }

            mailSender.send(message);
            log.info("Verification email sent to {} for purpose '{}'", toEmail, purpose);

        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send email. Please try again.");
        }
    }

    private String buildSignupEmailHtml(String code) {
        return """
            <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 32px;">
              <h2 style="color: #1a1a1a;">Welcome to TripWise ✈️</h2>
              <p style="color: #555;">Use the code below to verify your email address. It expires in <strong>10 minutes</strong>.</p>
              <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4f46e5;
                          background: #f0f0ff; border-radius: 8px; padding: 20px; text-align: center;">
                %s
              </div>
              <p style="color: #999; font-size: 12px; margin-top: 24px;">
                If you didn't sign up for TripWise, you can safely ignore this email.
              </p>
            </div>
            """.formatted(code);
    }

    private String buildResetEmailHtml(String code) {
        return """
            <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 32px;">
              <h2 style="color: #1a1a1a;">Reset your password</h2>
              <p style="color: #555;">Enter the code below in TripWise to reset your password. It expires in <strong>10 minutes</strong>.</p>
              <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4f46e5;
                          background: #f0f0ff; border-radius: 8px; padding: 20px; text-align: center;">
                %s
              </div>
              <p style="color: #999; font-size: 12px; margin-top: 24px;">
                If you didn't request a password reset, you can safely ignore this email.
              </p>
            </div>
            """.formatted(code);
    }
}
