package com.pawforward.api.notification;

import com.pawforward.api.notification.dto.NotificationResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Service
public class NotificationDispatcher {

    private static final Logger log = LoggerFactory.getLogger(NotificationDispatcher.class);

    private final NotificationService notificationService;
    private final EmailService emailService;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationDispatcher(NotificationService notificationService,
                                  EmailService emailService,
                                  SimpMessagingTemplate messagingTemplate) {
        this.notificationService = notificationService;
        this.emailService = emailService;
        this.messagingTemplate = messagingTemplate;
    }

    public void dispatchNotification(UUID userId, NotificationType type, String title,
                                     String message, Map<String, Object> data, String userEmail) {
        // 1. Create in-app notification
        Notification notification = notificationService.createNotification(userId, type, title, message, data);
        NotificationResponse response = NotificationResponse.from(notification);

        // 2. Push via WebSocket
        try {
            messagingTemplate.convertAndSendToUser(
                    userId.toString(),
                    "/queue/notifications",
                    response
            );
            log.debug("WebSocket notification sent to user {}: {}", userId, title);
        } catch (Exception e) {
            log.warn("Failed to send WebSocket notification to user {}: {}", userId, e.getMessage());
        }

        // 3. Send email for appropriate notification types
        if (userEmail != null && shouldSendEmail(type)) {
            sendEmailForType(type, userEmail, title, message, data);
        }
    }

    private boolean shouldSendEmail(NotificationType type) {
        return type == NotificationType.BOOKING_CONFIRMED
                || type == NotificationType.BOOKING_CANCELLED
                || type == NotificationType.PAYMENT_RECEIVED
                || type == NotificationType.TRAINING_UPDATE;
    }

    private void sendEmailForType(NotificationType type, String email, String title,
                                  String message, Map<String, Object> data) {
        try {
            String clientName = data != null && data.containsKey("clientName")
                    ? data.get("clientName").toString() : "Valued Client";

            switch (type) {
                case BOOKING_CONFIRMED -> {
                    String serviceName = getDataString(data, "serviceName");
                    String date = getDataString(data, "date");
                    String time = getDataString(data, "time");
                    emailService.sendBookingConfirmation(email, clientName, serviceName, date, time);
                }
                case BOOKING_CANCELLED -> {
                    String serviceName = getDataString(data, "serviceName");
                    String reason = getDataString(data, "reason");
                    emailService.sendBookingCancellation(email, clientName, serviceName, reason);
                }
                case PAYMENT_RECEIVED -> {
                    BigDecimal amount = data != null && data.containsKey("amount")
                            ? new BigDecimal(data.get("amount").toString())
                            : BigDecimal.ZERO;
                    String description = getDataString(data, "description");
                    emailService.sendPaymentReceipt(email, clientName, amount, description);
                }
                case TRAINING_UPDATE -> {
                    String dogName = getDataString(data, "dogName");
                    if (data != null && "BOARD_TRAIN".equals(data.get("updateType"))) {
                        String note = getDataString(data, "note");
                        emailService.sendBoardTrainDailyUpdate(email, clientName, dogName, note);
                    } else {
                        emailService.sendTrainingUpdate(email, clientName, dogName, message);
                    }
                }
                default -> emailService.sendSimpleEmail(email, title, message);
            }
        } catch (Exception e) {
            log.error("Failed to send email notification to {}: {}", email, e.getMessage());
        }
    }

    private String getDataString(Map<String, Object> data, String key) {
        if (data == null || !data.containsKey(key) || data.get(key) == null) {
            return "";
        }
        return data.get(key).toString();
    }
}
