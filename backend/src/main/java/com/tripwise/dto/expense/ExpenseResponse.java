package com.tripwise.dto.expense;

import com.tripwise.entity.Expense;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseResponse {
    
    private Long id;
    private Long tripId;
    private Long paidBy;
    private PaidByDto paidByUser;
    private String description;
    private BigDecimal amount;
    private String currency;
    private Expense.ExpenseCategory category;
    private LocalDate expenseDate;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaidByDto {
        private Long id;
        private String name;
        private String email;
        private String avatar;
    }
}
