package com.tripwise.repository;

import com.tripwise.entity.EmailVerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface EmailVerificationCodeRepository extends JpaRepository<EmailVerificationCode, Long> {

    Optional<EmailVerificationCode> findTopByEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(
            String email, String purpose);

    @Modifying
    @Query("UPDATE EmailVerificationCode e SET e.used = true WHERE e.email = :email AND e.purpose = :purpose")
    void markAllUsedByEmailAndPurpose(@Param("email") String email, @Param("purpose") String purpose);
}
