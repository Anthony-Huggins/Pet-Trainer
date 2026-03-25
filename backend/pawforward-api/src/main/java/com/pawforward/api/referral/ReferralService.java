package com.pawforward.api.referral;

import com.pawforward.api.payment.Payment;
import com.pawforward.api.payment.PaymentRepository;
import com.pawforward.api.referral.dto.ReferralCodeResponse;
import com.pawforward.api.referral.dto.ReferralDashboardResponse;
import com.pawforward.api.referral.dto.ReferralRedemptionResponse;
import com.pawforward.api.user.User;
import com.pawforward.api.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;

@Service
public class ReferralService {

    private static final String ALPHANUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int CODE_LENGTH = 8;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final ReferralCodeRepository referralCodeRepository;
    private final ReferralRedemptionRepository referralRedemptionRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;

    public ReferralService(ReferralCodeRepository referralCodeRepository,
                           ReferralRedemptionRepository referralRedemptionRepository,
                           UserRepository userRepository,
                           PaymentRepository paymentRepository) {
        this.referralCodeRepository = referralCodeRepository;
        this.referralRedemptionRepository = referralRedemptionRepository;
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional
    public ReferralCodeResponse getOrCreateReferralCode(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        List<ReferralCode> existingCodes = referralCodeRepository.findByReferrerId(userId);
        if (!existingCodes.isEmpty()) {
            return ReferralCodeResponse.from(existingCodes.get(0));
        }

        String code = generateUniqueCode();

        ReferralCode referralCode = ReferralCode.builder()
                .referrer(user)
                .code(code)
                .discountPercent(10)
                .timesUsed(0)
                .active(true)
                .build();

        referralCode = referralCodeRepository.save(referralCode);
        return ReferralCodeResponse.from(referralCode);
    }

    @Transactional(readOnly = true)
    public ReferralDashboardResponse getReferralDashboard(UUID userId) {
        List<ReferralCode> codes = referralCodeRepository.findByReferrerId(userId);
        if (codes.isEmpty()) {
            throw new EntityNotFoundException("No referral code found for user");
        }

        ReferralCode referralCode = codes.get(0);
        List<ReferralRedemption> redemptions = referralRedemptionRepository
                .findByReferralCodeIdOrderByCreatedAtDesc(referralCode.getId());

        BigDecimal totalSavings = redemptions.stream()
                .map(r -> r.getDiscountApplied() != null ? r.getDiscountApplied() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<ReferralRedemptionResponse> redemptionResponses = redemptions.stream()
                .map(ReferralRedemptionResponse::from)
                .toList();

        return ReferralDashboardResponse.builder()
                .code(ReferralCodeResponse.from(referralCode))
                .redemptions(redemptionResponses)
                .totalSavingsGenerated(totalSavings)
                .build();
    }

    @Transactional(readOnly = true)
    public int validateReferralCode(String code) {
        ReferralCode referralCode = referralCodeRepository.findByCodeAndActiveTrue(code)
                .orElseThrow(() -> new EntityNotFoundException("Referral code not found or inactive"));

        if (referralCode.getMaxUses() != null && referralCode.getTimesUsed() >= referralCode.getMaxUses()) {
            throw new IllegalStateException("Referral code has reached its maximum number of uses");
        }

        return referralCode.getDiscountPercent();
    }

    @Transactional
    public ReferralRedemptionResponse redeemReferralCode(String code, UUID referredUserId,
                                                          UUID paymentId, BigDecimal discountApplied) {
        ReferralCode referralCode = referralCodeRepository.findByCodeAndActiveTrue(code)
                .orElseThrow(() -> new EntityNotFoundException("Referral code not found or inactive"));

        if (referralCode.getMaxUses() != null && referralCode.getTimesUsed() >= referralCode.getMaxUses()) {
            throw new IllegalStateException("Referral code has reached its maximum number of uses");
        }

        User referredUser = userRepository.findById(referredUserId)
                .orElseThrow(() -> new EntityNotFoundException("Referred user not found"));

        Payment payment = null;
        if (paymentId != null) {
            payment = paymentRepository.findById(paymentId)
                    .orElseThrow(() -> new EntityNotFoundException("Payment not found"));
        }

        ReferralRedemption redemption = ReferralRedemption.builder()
                .referralCode(referralCode)
                .referredUser(referredUser)
                .payment(payment)
                .discountApplied(discountApplied)
                .build();

        redemption = referralRedemptionRepository.save(redemption);

        referralCode.setTimesUsed(referralCode.getTimesUsed() + 1);
        referralCodeRepository.save(referralCode);

        return ReferralRedemptionResponse.from(redemption);
    }

    private String generateUniqueCode() {
        String code;
        do {
            StringBuilder sb = new StringBuilder(CODE_LENGTH);
            for (int i = 0; i < CODE_LENGTH; i++) {
                sb.append(ALPHANUMERIC.charAt(RANDOM.nextInt(ALPHANUMERIC.length())));
            }
            code = sb.toString();
        } while (referralCodeRepository.findByCode(code).isPresent());
        return code;
    }
}
