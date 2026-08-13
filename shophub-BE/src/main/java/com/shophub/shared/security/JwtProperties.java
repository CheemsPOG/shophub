package com.shophub.shared.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "shophub.jwt")
public class JwtProperties {

    private String secret = "shophub-v2-dev-secret-change-me-please-32b";
    private long accessTokenTtlMinutes = 30;
    private long refreshTokenTtlDays = 7;
    private long rememberMeTtlDays = 30;

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public long getAccessTokenTtlMinutes() {
        return accessTokenTtlMinutes;
    }

    public void setAccessTokenTtlMinutes(long accessTokenTtlMinutes) {
        this.accessTokenTtlMinutes = accessTokenTtlMinutes;
    }

    public long getRefreshTokenTtlDays() {
        return refreshTokenTtlDays;
    }

    public void setRefreshTokenTtlDays(long refreshTokenTtlDays) {
        this.refreshTokenTtlDays = refreshTokenTtlDays;
    }

    public long getRememberMeTtlDays() {
        return rememberMeTtlDays;
    }

    public void setRememberMeTtlDays(long rememberMeTtlDays) {
        this.rememberMeTtlDays = rememberMeTtlDays;
    }
}
