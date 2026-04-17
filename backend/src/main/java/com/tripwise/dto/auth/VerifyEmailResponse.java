package com.tripwise.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VerifyEmailResponse {
    private String verificationToken;
    private String message;
}
