package com.tripwise.security;

import com.tripwise.entity.User;
import com.tripwise.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String googleId = (String) attributes.get("sub");
        String email    = (String) attributes.get("email");
        String name     = (String) attributes.get("name");
        String avatar   = (String) attributes.get("picture");

        User user = userRepository.findByGoogleId(googleId)
                .or(() -> userRepository.findByEmail(email))
                .map(existing -> updateGoogleUser(existing, googleId, name, avatar))
                .orElseGet(() -> createGoogleUser(googleId, email, name, avatar));

        userRepository.save(user);
        log.info("Google OAuth login for user: {}", email);

        return new OAuth2UserPrincipal(user, attributes);
    }

    private User updateGoogleUser(User user, String googleId, String name, String avatar) {
        user.setGoogleId(googleId);
        user.setAuthProvider(User.AuthProvider.google);
        user.setEmailVerified(true);
        if (user.getName() == null) user.setName(name);
        if (user.getAvatar() == null) user.setAvatar(avatar);
        return user;
    }

    private User createGoogleUser(String googleId, String email, String name, String avatar) {
        return User.builder()
                .googleId(googleId)
                .email(email)
                .name(name)
                .avatar(avatar)
                .authProvider(User.AuthProvider.google)
                .emailVerified(true)
                .onboardingCompleted(false)
                .isDeleted(false)
                .build();
    }
}
