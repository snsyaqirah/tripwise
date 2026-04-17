package com.tripwise.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class VerifyEmailRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Code is required")
    @Size(min = 6, max = 6, message = "Code must be 6 digits")
    private String code;

    /** 'signup' or 'forgot_password' */
    @NotBlank(message = "Purpose is required")
    private String purpose;
}
