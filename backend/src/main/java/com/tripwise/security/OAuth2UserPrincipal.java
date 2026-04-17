package com.tripwise.security;

import com.tripwise.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;

/**
 * Wraps our User entity as an OAuth2User so Spring Security can
 * carry it through the OAuth2 authentication pipeline.
 */
public class OAuth2UserPrincipal implements OAuth2User {

    private final User user;
    private final Map<String, Object> attributes;

    public OAuth2UserPrincipal(User user, Map<String, Object> attributes) {
        this.user       = user;
        this.attributes = attributes;
    }

    public User getUser() { return user; }

    @Override public Map<String, Object> getAttributes()                           { return attributes; }
    @Override public Collection<? extends GrantedAuthority> getAuthorities()      { return Collections.emptyList(); }
    @Override public String getName()                                              { return user.getEmail(); }
}
