package com.pawforward.api.referral;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReferralCodeRepository extends JpaRepository<ReferralCode, UUID> {

    List<ReferralCode> findByReferrerId(UUID referrerId);

    Optional<ReferralCode> findByCode(String code);

    Optional<ReferralCode> findByCodeAndActiveTrue(String code);
}
