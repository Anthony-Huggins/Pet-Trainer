package com.pawforward.api.notification;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.from:noreply@pawforward.com}")
    private String fromAddress;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendSimpleEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Simple email sent to {}: {}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send simple email to {}: {}", to, e.getMessage());
        }
    }

    @Async
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(mimeMessage);
            log.info("HTML email sent to {}: {}", to, subject);
        } catch (MessagingException e) {
            log.error("Failed to send HTML email to {}: {}", to, e.getMessage());
        }
    }

    @Async
    public void sendBookingConfirmation(String to, String clientName, String serviceName,
                                        String date, String time) {
        String subject = "Booking Confirmed - " + serviceName;
        String html = buildEmailTemplate(
                "Booking Confirmed",
                "<p>Hi " + escapeHtml(clientName) + ",</p>"
                + "<p>Your booking has been confirmed! Here are the details:</p>"
                + "<table style=\"width:100%;border-collapse:collapse;margin:16px 0;\">"
                + "<tr><td style=\"padding:8px;font-weight:bold;\">Service:</td>"
                + "<td style=\"padding:8px;\">" + escapeHtml(serviceName) + "</td></tr>"
                + "<tr><td style=\"padding:8px;font-weight:bold;\">Date:</td>"
                + "<td style=\"padding:8px;\">" + escapeHtml(date) + "</td></tr>"
                + "<tr><td style=\"padding:8px;font-weight:bold;\">Time:</td>"
                + "<td style=\"padding:8px;\">" + escapeHtml(time) + "</td></tr>"
                + "</table>"
                + "<p>If you need to make any changes, please log in to your account or contact us.</p>"
        );
        sendHtmlEmail(to, subject, html);
    }

    @Async
    public void sendBookingCancellation(String to, String clientName, String serviceName, String reason) {
        String subject = "Booking Cancelled - " + serviceName;
        String html = buildEmailTemplate(
                "Booking Cancelled",
                "<p>Hi " + escapeHtml(clientName) + ",</p>"
                + "<p>Your booking for <strong>" + escapeHtml(serviceName)
                + "</strong> has been cancelled.</p>"
                + (reason != null && !reason.isBlank()
                    ? "<p><strong>Reason:</strong> " + escapeHtml(reason) + "</p>" : "")
                + "<p>If you'd like to rebook, please visit your dashboard.</p>"
        );
        sendHtmlEmail(to, subject, html);
    }

    @Async
    public void sendPaymentReceipt(String to, String clientName, BigDecimal amount, String description) {
        String subject = "Payment Receipt - PawForward Academy";
        String html = buildEmailTemplate(
                "Payment Receipt",
                "<p>Hi " + escapeHtml(clientName) + ",</p>"
                + "<p>We've received your payment. Here are the details:</p>"
                + "<table style=\"width:100%;border-collapse:collapse;margin:16px 0;\">"
                + "<tr><td style=\"padding:8px;font-weight:bold;\">Amount:</td>"
                + "<td style=\"padding:8px;\">$" + amount.toPlainString() + "</td></tr>"
                + "<tr><td style=\"padding:8px;font-weight:bold;\">Description:</td>"
                + "<td style=\"padding:8px;\">" + escapeHtml(description) + "</td></tr>"
                + "</table>"
                + "<p>Thank you for choosing PawForward Academy!</p>"
        );
        sendHtmlEmail(to, subject, html);
    }

    @Async
    public void sendTrainingUpdate(String to, String clientName, String dogName, String summary) {
        String subject = "Training Update for " + dogName;
        String html = buildEmailTemplate(
                "Training Update",
                "<p>Hi " + escapeHtml(clientName) + ",</p>"
                + "<p>Here's the latest training update for <strong>"
                + escapeHtml(dogName) + "</strong>:</p>"
                + "<div style=\"background:#f8f9fa;padding:16px;border-radius:8px;margin:16px 0;\">"
                + "<p>" + escapeHtml(summary) + "</p>"
                + "</div>"
                + "<p>Log in to your dashboard to see the full training progress.</p>"
        );
        sendHtmlEmail(to, subject, html);
    }

    @Async
    public void sendBoardTrainDailyUpdate(String to, String clientName, String dogName, String note) {
        String subject = "Daily Update for " + dogName + " - Board & Train";
        String html = buildEmailTemplate(
                "Board & Train Daily Update",
                "<p>Hi " + escapeHtml(clientName) + ",</p>"
                + "<p>Here's today's update for <strong>" + escapeHtml(dogName)
                + "</strong> in the Board & Train program:</p>"
                + "<div style=\"background:#f8f9fa;padding:16px;border-radius:8px;margin:16px 0;\">"
                + "<p>" + escapeHtml(note) + "</p>"
                + "</div>"
                + "<p>Check your dashboard for photos and more details.</p>"
        );
        sendHtmlEmail(to, subject, html);
    }

    private String buildEmailTemplate(String heading, String content) {
        return "<!DOCTYPE html>"
                + "<html><head><meta charset=\"UTF-8\"></head>"
                + "<body style=\"margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;"
                + "background-color:#f4f4f4;\">"
                + "<div style=\"max-width:600px;margin:0 auto;background:#ffffff;\">"
                // Header
                + "<div style=\"background:#2563eb;padding:24px;text-align:center;\">"
                + "<h1 style=\"color:#ffffff;margin:0;font-size:24px;\">PawForward Academy</h1>"
                + "</div>"
                // Content
                + "<div style=\"padding:32px 24px;\">"
                + "<h2 style=\"color:#1f2937;margin-top:0;\">" + escapeHtml(heading) + "</h2>"
                + content
                + "</div>"
                // Footer
                + "<div style=\"background:#f9fafb;padding:16px 24px;text-align:center;"
                + "font-size:12px;color:#6b7280;border-top:1px solid #e5e7eb;\">"
                + "<p style=\"margin:0;\">PawForward Academy | Professional Dog Training</p>"
                + "<p style=\"margin:4px 0 0;\">This is an automated message. Please do not reply.</p>"
                + "</div>"
                + "</div>"
                + "</body></html>";
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;");
    }
}
