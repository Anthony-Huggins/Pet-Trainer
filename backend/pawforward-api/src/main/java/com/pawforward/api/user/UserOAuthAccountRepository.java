package com.pawforward.api.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserOAuthAccountRepository extends JpaRepository<UserOAuthAccount, UUID> {

    Optional<UserOAuthAccount> findByProviderAndProviderAccountId(String provider, String providerAccountId);
}
