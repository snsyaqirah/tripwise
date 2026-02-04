package com.tripwise.controller;

import com.tripwise.dto.expense.CreateExpenseRequest;
import com.tripwise.dto.expense.ExpenseResponse;
import com.tripwise.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<ExpenseResponse> createExpense(
            @Valid @RequestBody CreateExpenseRequest request,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        ExpenseResponse response = expenseService.createExpense(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<ExpenseResponse>> getExpensesByTrip(@PathVariable Long tripId) {
        List<ExpenseResponse> expenses = expenseService.getExpensesByTrip(tripId);
        return ResponseEntity.ok(expenses);
    }

    @DeleteMapping("/{expenseId}")
    public ResponseEntity<Void> deleteExpense(
            @PathVariable Long expenseId,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        expenseService.deleteExpense(expenseId, userId);
        return ResponseEntity.noContent().build();
    }
}
