package com.pawforward.api.security;

import com.pawforward.api.user.User;
import com.pawforward.api.user.UserOAuthAccount;
import com.pawforward.api.user.UserOAuthAccountRepository;
import com.pawforward.api.user.UserRepository;
import com.pawforward.api.user.UserRole;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final UserOAuthAccountRepository oauthAccountRepository;

    public CustomOAuth2UserService(UserRepository userRepository,
                                   UserOAuthAccountRepository oauthAccountRepository) {
        this.userRepository = userRepository;
        this.oauthAccountRepository = oauthAccountRepository;
    }

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String provider = userRequest.getClientRegistration().getRegistrationId(); // "google"
        String providerAccountId = oAuth2User.getAttribute("sub");
        String email = oAuth2User.getAttribute("email");
        String firstName = oAuth2User.getAttribute("given_name");
        String lastName = oAuth2User.getAttribute("family_name");
        String picture = oAuth2User.getAttribute("picture");

        // Look up by OAuth provider + account ID
        Optional<UserOAuthAccount> existingOAuth = oauthAccountRepository
                .findByProviderAndProviderAccountId(provider, providerAccountId);

        User user;
        if (existingOAuth.isPresent()) {
            // Returning OAuth user
            user = existingOAuth.get().getUser();
            // Update avatar if not set
            if (user.getAvatarUrl() == null && picture != null) {
                user.setAvatarUrl(picture);
                userRepository.save(user);
            }
        } else {
            // First time OAuth login - check if email already exists
            Optional<User> existingUser = userRepository.findByEmail(email);
            if (existingUser.isPresent()) {
                // Link OAuth account to existing email/password user
                user = existingUser.get();
            } else {
                // Brand new user via OAuth
                user = User.builder()
                        .email(email)
                        .firstName(firstName != null ? firstName : "")
                        .lastName(lastName != null ? lastName : "")
                        .avatarUrl(picture)
                        .role(UserRole.CLIENT)
                        .emailVerified(true) // Google already verified their email
                        .enabled(true)
                        .build();
                user = userRepository.save(user);
            }

            // Create the OAuth account link
            UserOAuthAccount oauthAccount = UserOAuthAccount.builder()
                    .user(user)
                    .provider(provider)
                    .providerAccountId(providerAccountId)
                    .build();
            oauthAccountRepository.save(oauthAccount);
        }

        return oAuth2User;
    }
}
