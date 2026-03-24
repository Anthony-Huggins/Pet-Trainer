package com.pawforward.api.payment;

import com.pawforward.api.booking.Booking;
import com.pawforward.api.booking.BookingRepository;
import com.pawforward.api.booking.BookingStatus;
import com.pawforward.api.notification.NotificationDispatcher;
import com.pawforward.api.notification.NotificationType;
import com.pawforward.api.payment.dto.CheckoutResponse;
import com.pawforward.api.user.User;
import com.pawforward.api.user.UserRepository;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.Event;
import com.stripe.model.Refund;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.RefundCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class StripeService {

    private static final Logger log = LoggerFactory.getLogger(StripeService.class);

    @Value("${app.stripe.secret-key}")
    private String secretKey;

    @Value("${app.stripe.webhook-secret}")
    private String webhookSecret;

    @Value("${app.stripe.success-url}")
    private String defaultSuccessUrl;

    @Value("${app.stripe.cancel-url}")
    private String defaultCancelUrl;

    private final PaymentRepository paymentRepository;
    private final PackageRepository packageRepository;
    private final ClientPackageRepository clientPackageRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final NotificationDispatcher notificationDispatcher;

    public StripeService(PaymentRepository paymentRepository,
                         PackageRepository packageRepository,
                         ClientPackageRepository clientPackageRepository,
                         BookingRepository bookingRepository,
                         UserRepository userRepository,
                         NotificationDispatcher notificationDispatcher) {
        this.paymentRepository = paymentRepository;
        this.packageRepository = packageRepository;
        this.clientPackageRepository = clientPackageRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.notificationDispatcher = notificationDispatcher;
    }

    @PostConstruct
    public void init() {
        Stripe.apiKey = secretKey;
    }

    @Transactional
    public CheckoutResponse createBookingCheckout(UUID bookingId, String userEmail) {
        User user = findUserByEmail(userEmail);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

        if (!booking.getClient().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Booking does not belong to current user");
        }

        BigDecimal price = booking.getSession().getServiceType().getPrice();
        String serviceName = booking.getSession().getServiceType().getName();

        try {
            String customerId = getOrCreateStripeCustomer(user);

            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setCustomer(customerId)
                    .setCustomerEmail(customerId == null ? user.getEmail() : null)
                    .setSuccessUrl(defaultSuccessUrl)
                    .setCancelUrl(defaultCancelUrl)
                    .addLineItem(SessionCreateParams.LineItem.builder()
                            .setQuantity(1L)
                            .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                    .setCurrency("usd")
                                    .setUnitAmount(price.multiply(BigDecimal.valueOf(100)).longValue())
                                    .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                            .setName(serviceName)
                                            .setDescription("Booking for " + serviceName)
                                            .build())
                                    .build())
                            .build())
                    .putMetadata("bookingId", bookingId.toString())
                    .putMetadata("type", "BOOKING")
                    .putMetadata("userId", user.getId().toString())
                    .build();

            Session session = Session.create(params);

            return CheckoutResponse.builder()
                    .checkoutUrl(session.getUrl())
                    .sessionId(session.getId())
                    .build();
        } catch (StripeException e) {
            log.error("Stripe checkout creation failed for booking {}: {}", bookingId, e.getMessage());
            throw new IllegalStateException("Failed to create checkout session: " + e.getMessage());
        }
    }

    @Transactional
    public CheckoutResponse createPackageCheckout(UUID packageId, String userEmail) {
        User user = findUserByEmail(userEmail);
        TrainingPackage trainingPackage = packageRepository.findById(packageId)
                .orElseThrow(() -> new EntityNotFoundException("Package not found"));

        if (!trainingPackage.isActive()) {
            throw new IllegalStateException("Package is no longer available");
        }

        try {
            String customerId = getOrCreateStripeCustomer(user);

            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setCustomer(customerId)
                    .setCustomerEmail(customerId == null ? user.getEmail() : null)
                    .setSuccessUrl(defaultSuccessUrl)
                    .setCancelUrl(defaultCancelUrl)
                    .addLineItem(SessionCreateParams.LineItem.builder()
                            .setQuantity(1L)
                            .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                    .setCurrency("usd")
                                    .setUnitAmount(trainingPackage.getPrice().multiply(BigDecimal.valueOf(100)).longValue())
                                    .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                            .setName(trainingPackage.getName())
                                            .setDescription(trainingPackage.getDescription())
                                            .build())
                                    .build())
                            .build())
                    .putMetadata("packageId", packageId.toString())
                    .putMetadata("type", "PACKAGE")
                    .putMetadata("userId", user.getId().toString())
                    .build();

            Session session = Session.create(params);

            return CheckoutResponse.builder()
                    .checkoutUrl(session.getUrl())
                    .sessionId(session.getId())
                    .build();
        } catch (StripeException e) {
            log.error("Stripe checkout creation failed for package {}: {}", packageId, e.getMessage());
            throw new IllegalStateException("Failed to create checkout session: " + e.getMessage());
        }
    }

    public void handleWebhookEvent(String payload, String sigHeader) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.error("Stripe webhook signature verification failed: {}", e.getMessage());
            throw new IllegalArgumentException("Invalid Stripe webhook signature");
        } catch (Exception e) {
            log.error("Failed to parse Stripe webhook event: {}", e.getMessage());
            throw new IllegalArgumentException("Invalid webhook payload");
        }

        if ("checkout.session.completed".equals(event.getType())) {
            Session session = (Session) event.getDataObjectDeserializer()
                    .getObject()
                    .orElseThrow(() -> new IllegalStateException("Failed to deserialize checkout session"));
            processSuccessfulPayment(session);
        } else {
            log.info("Unhandled Stripe event type: {}", event.getType());
        }
    }

    @Transactional
    public void processSuccessfulPayment(Session session) {
        Map<String, String> metadata = session.getMetadata();
        String type = metadata.get("type");
        String userId = metadata.get("userId");

        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        BigDecimal amount = BigDecimal.valueOf(session.getAmountTotal())
                .divide(BigDecimal.valueOf(100));

        if ("BOOKING".equals(type)) {
            UUID bookingId = UUID.fromString(metadata.get("bookingId"));
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

            Payment payment = Payment.builder()
                    .client(user)
                    .booking(booking)
                    .amount(amount)
                    .currency("usd")
                    .paymentType("BOOKING")
                    .status("COMPLETED")
                    .stripeCheckoutSessionId(session.getId())
                    .stripePaymentIntentId(session.getPaymentIntent())
                    .description("Payment for " + booking.getSession().getServiceType().getName())
                    .build();
            paymentRepository.save(payment);

            booking.setStatus(BookingStatus.CONFIRMED);
            bookingRepository.save(booking);

            // Dispatch payment received notification
            Map<String, Object> notifData = new HashMap<>();
            notifData.put("clientName", user.getFullName());
            notifData.put("amount", amount.toPlainString());
            notifData.put("description", payment.getDescription());
            notifData.put("bookingId", bookingId.toString());
            notificationDispatcher.dispatchNotification(
                    user.getId(),
                    NotificationType.PAYMENT_RECEIVED,
                    "Payment Received",
                    "Your payment of $" + amount.toPlainString() + " has been received.",
                    notifData,
                    user.getEmail()
            );

            log.info("Processed booking payment for booking {} by user {}", bookingId, userId);

        } else if ("PACKAGE".equals(type)) {
            UUID packageId = UUID.fromString(metadata.get("packageId"));
            TrainingPackage trainingPackage = packageRepository.findById(packageId)
                    .orElseThrow(() -> new EntityNotFoundException("Package not found"));

            Payment payment = Payment.builder()
                    .client(user)
                    .amount(amount)
                    .currency("usd")
                    .paymentType("PACKAGE")
                    .status("COMPLETED")
                    .stripeCheckoutSessionId(session.getId())
                    .stripePaymentIntentId(session.getPaymentIntent())
                    .description("Purchase of " + trainingPackage.getName() + " package")
                    .build();
            paymentRepository.save(payment);

            Instant expiresAt = trainingPackage.getValidDays() != null
                    ? Instant.now().plus(trainingPackage.getValidDays(), ChronoUnit.DAYS)
                    : null;

            ClientPackage clientPackage = ClientPackage.builder()
                    .client(user)
                    .trainingPackage(trainingPackage)
                    .sessionsRemaining(trainingPackage.getSessionCount())
                    .purchasedAt(Instant.now())
                    .expiresAt(expiresAt)
                    .status("ACTIVE")
                    .build();
            clientPackageRepository.save(clientPackage);

            // Dispatch payment received notification
            Map<String, Object> notifData = new HashMap<>();
            notifData.put("clientName", user.getFullName());
            notifData.put("amount", amount.toPlainString());
            notifData.put("description", payment.getDescription());
            notifData.put("packageId", packageId.toString());
            notificationDispatcher.dispatchNotification(
                    user.getId(),
                    NotificationType.PAYMENT_RECEIVED,
                    "Payment Received",
                    "Your payment of $" + amount.toPlainString() + " for " + trainingPackage.getName() + " has been received.",
                    notifData,
                    user.getEmail()
            );

            log.info("Processed package payment for package {} by user {}", packageId, userId);

        } else {
            log.warn("Unknown payment type in metadata: {}", type);
        }
    }

    @Transactional
    public String getOrCreateStripeCustomer(User user) {
        if (user.getStripeCustomerId() != null) {
            return user.getStripeCustomerId();
        }

        try {
            CustomerCreateParams params = CustomerCreateParams.builder()
                    .setEmail(user.getEmail())
                    .setName(user.getFullName())
                    .putMetadata("userId", user.getId().toString())
                    .build();

            Customer customer = Customer.create(params);
            user.setStripeCustomerId(customer.getId());
            userRepository.save(user);

            return customer.getId();
        } catch (StripeException e) {
            log.error("Failed to create Stripe customer for user {}: {}", user.getId(), e.getMessage());
            return null;
        }
    }

    @Transactional
    public void refundPayment(UUID paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new EntityNotFoundException("Payment not found"));

        if (!"COMPLETED".equals(payment.getStatus())) {
            throw new IllegalStateException("Can only refund completed payments");
        }

        if (payment.getStripePaymentIntentId() == null) {
            throw new IllegalStateException("No Stripe payment intent found for this payment");
        }

        try {
            RefundCreateParams params = RefundCreateParams.builder()
                    .setPaymentIntent(payment.getStripePaymentIntentId())
                    .build();

            Refund.create(params);

            payment.setStatus("REFUNDED");
            paymentRepository.save(payment);

            log.info("Refunded payment {}", paymentId);
        } catch (StripeException e) {
            log.error("Failed to refund payment {}: {}", paymentId, e.getMessage());
            throw new IllegalStateException("Failed to process refund: " + e.getMessage());
        }
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }
}
