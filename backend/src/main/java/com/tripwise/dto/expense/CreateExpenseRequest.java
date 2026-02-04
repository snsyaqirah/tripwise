package com.tripwise.dto.expense;

import com.tripwise.entity.Expense;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

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
}
