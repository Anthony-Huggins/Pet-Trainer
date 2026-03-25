package com.pawforward.api.referral;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReferralRedemptionRepository extends JpaRepository<ReferralRedemption, UUID> {

    List<ReferralRedemption> findByReferralCodeIdOrderByCreatedAtDesc(UUID referralCodeId);

    List<ReferralRedemption> findByReferredUserId(UUID referredUserId);

    long countByReferralCodeId(UUID referralCodeId);
}
