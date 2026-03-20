package com.pawforward.api.payment;

import com.pawforward.api.payment.dto.CheckoutRequest;
import com.pawforward.api.payment.dto.CheckoutResponse;
import com.pawforward.api.payment.dto.ClientPackageResponse;
import com.pawforward.api.payment.dto.PackageResponse;
import com.pawforward.api.payment.dto.PaymentResponse;
import com.pawforward.api.security.SecurityUtils;
import com.pawforward.api.user.User;
import com.pawforward.api.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final StripeService stripeService;
    private final PaymentRepository paymentRepository;
    private final PackageRepository packageRepository;
    private final ClientPackageRepository clientPackageRepository;
    private final UserRepository userRepository;

    public PaymentController(StripeService stripeService,
                             PaymentRepository paymentRepository,
                             PackageRepository packageRepository,
                             ClientPackageRepository clientPackageRepository,
                             UserRepository userRepository) {
        this.stripeService = stripeService;
        this.paymentRepository = paymentRepository;
        this.packageRepository = packageRepository;
        this.clientPackageRepository = clientPackageRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/checkout/booking")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CheckoutResponse> checkoutBooking(@RequestBody CheckoutRequest request) {
        String email = getCurrentUserEmail();
        CheckoutResponse response = stripeService.createBookingCheckout(request.getBookingId(), email);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/checkout/package")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CheckoutResponse> checkoutPackage(@RequestBody CheckoutRequest request) {
        String email = getCurrentUserEmail();
        CheckoutResponse response = stripeService.createPackageCheckout(request.getPackageId(), email);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        stripeService.handleWebhookEvent(payload, sigHeader);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/my-payments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PaymentResponse>> getMyPayments() {
        User user = getCurrentUser();
        List<PaymentResponse> payments = paymentRepository
                .findByClientIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(PaymentResponse::from)
                .toList();
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/packages")
    public ResponseEntity<List<PackageResponse>> getActivePackages() {
        List<PackageResponse> packages = packageRepository.findByActiveTrue()
                .stream()
                .map(PackageResponse::from)
                .toList();
        return ResponseEntity.ok(packages);
    }

    @GetMapping("/my-packages")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ClientPackageResponse>> getMyPackages() {
        User user = getCurrentUser();
        List<ClientPackageResponse> packages = clientPackageRepository
                .findByClientIdOrderByPurchasedAtDesc(user.getId())
                .stream()
                .map(ClientPackageResponse::from)
                .toList();
        return ResponseEntity.ok(packages);
    }

    @PostMapping("/{id}/refund")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> refundPayment(@PathVariable UUID id) {
        stripeService.refundPayment(id);
        return ResponseEntity.ok().build();
    }

    private String getCurrentUserEmail() {
        return SecurityUtils.getCurrentUserEmail()
                .orElseThrow(() -> new IllegalStateException("Not authenticated"));
    }

    private User getCurrentUser() {
        String email = getCurrentUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }
}
