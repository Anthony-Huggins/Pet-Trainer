package com.pawforward.api.payment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    List<Payment> findByClientIdOrderByCreatedAtDesc(UUID clientId);

    Optional<Payment> findByStripeCheckoutSessionId(String stripeCheckoutSessionId);

    Optional<Payment> findByStripePaymentIntentId(String stripePaymentIntentId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = :status")
    BigDecimal sumAmountByStatus(@Param("status") String status);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = :status AND p.createdAt >= :after")
    BigDecimal sumAmountByStatusAndCreatedAtAfter(@Param("status") String status, @Param("after") Instant after);

    List<Payment> findByStatus(String status);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = :status AND p.createdAt >= :from AND p.createdAt < :to")
    BigDecimal sumAmountByStatusAndCreatedAtBetween(@Param("status") String status,
                                                     @Param("from") Instant from,
                                                     @Param("to") Instant to);
}
