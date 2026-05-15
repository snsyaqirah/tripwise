package com.travelluhh.dto.expense;

import com.travelluhh.entity.Expense;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class CreateExpenseRequest {

    @NotNull(message = "Trip ID is required")
    private Long tripId;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Amount must be greater than 0")
    private BigDecimal amount;

    @NotBlank(message = "Currency is required")
    @Size(min = 3, max = 3, message = "Currency code must be 3 characters")
    private String currency;

    @NotNull(message = "Category is required")
    private Expense.ExpenseCategory category;

    @NotNull(message = "Expense date is required")
    private LocalDate expenseDate;

    private String notes;

    private List<SubItemRequest> subItems;

    @Data
    public static class SubItemRequest {
        @NotBlank(message = "Sub-item description is required")
        private String description;

        @NotNull
        @DecimalMin(value = "0.0", inclusive = false)
        private BigDecimal amount;

        private Expense.ExpenseCategory category;
    }
}
