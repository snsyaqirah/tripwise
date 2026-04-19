package com.tripwise.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "expenses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "expense_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(name = "added_by")
    private Long addedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "added_by", insertable = false, updatable = false)
    private User addedByUser;

    @Column(nullable = true)
    private String description;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "original_amount", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal originalAmount = BigDecimal.ZERO;

    @Column(name = "original_currency", nullable = false, length = 3)
    @Builder.Default
    private String originalCurrency = "USD";

    @Column(name = "converted_amount", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal convertedAmount = BigDecimal.ZERO;

    @Column(nullable = false, length = 3)
    private String currency;

    // DB column is named "date", not "expense_date"
    @Column(name = "date", nullable = false)
    private LocalDate expenseDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ExpenseCategory category;

    @Column(name = "is_deleted")
    @Builder.Default
    private Boolean isDeleted = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum ExpenseCategory {
        accommodation,
        transportation,
        food,
        activities,
        shopping,
        other
    }
}
