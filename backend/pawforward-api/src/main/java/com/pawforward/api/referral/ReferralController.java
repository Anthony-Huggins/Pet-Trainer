package com.pawforward.api.referral;

import com.pawforward.api.referral.dto.RedeemReferralRequest;
import com.pawforward.api.referral.dto.ReferralCodeResponse;
import com.pawforward.api.referral.dto.ReferralDashboardResponse;
import com.pawforward.api.referral.dto.ReferralRedemptionResponse;
import com.pawforward.api.security.SecurityUtils;
import com.pawforward.api.user.User;
import com.pawforward.api.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/referrals")
public class ReferralController {

    private final ReferralService referralService;
    private final UserRepository userRepository;

    public ReferralController(ReferralService referralService, UserRepository userRepository) {
        this.referralService = referralService;
        this.userRepository = userRepository;
    }

    @GetMapping("/my-code")
    public ResponseEntity<ReferralCodeResponse> getOrCreateMyCode() {
        User user = getCurrentUser();
        return ResponseEntity.ok(referralService.getOrCreateReferralCode(user.getId()));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ReferralDashboardResponse> getDashboard() {
        User user = getCurrentUser();
        return ResponseEntity.ok(referralService.getReferralDashboard(user.getId()));
    }

    @GetMapping("/validate/{code}")
    public ResponseEntity<Map<String, Integer>> validateCode(@PathVariable String code) {
        int discountPercent = referralService.validateReferralCode(code);
        return ResponseEntity.ok(Map.of("discountPercent", discountPercent));
    }

    @PostMapping("/redeem")
    public ResponseEntity<ReferralRedemptionResponse> redeemCode(@Valid @RequestBody RedeemReferralRequest request) {
        User user = getCurrentUser();
        ReferralRedemptionResponse response = referralService.redeemReferralCode(
                request.getCode(),
                user.getId(),
                request.getPaymentId(),
                request.getDiscountApplied()
        );
        return ResponseEntity.ok(response);
    }

    private User getCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail()
                .orElseThrow(() -> new IllegalStateException("Not authenticated"));
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }
}
