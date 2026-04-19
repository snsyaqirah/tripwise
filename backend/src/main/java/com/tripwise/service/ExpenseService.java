package com.tripwise.service;

import com.tripwise.dto.expense.CreateExpenseRequest;
import com.tripwise.dto.expense.ExpenseResponse;
import com.tripwise.entity.Expense;
import com.tripwise.entity.Trip;
import com.tripwise.entity.User;
import com.tripwise.repository.ExpenseRepository;
import com.tripwise.repository.TripRepository;
import com.tripwise.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    public ExpenseResponse createExpense(CreateExpenseRequest request, String userEmail) {
        // Verify trip exists
        Trip trip = tripRepository.findById(request.getTripId())
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        // Get user by email
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create expense
        Expense expense = Expense.builder()
                .trip(trip)
                .addedBy(user.getId())
                .description(request.getDescription())
                .amount(request.getAmount())
                .currency(request.getCurrency())
                .category(request.getCategory())
                .expenseDate(request.getExpenseDate())
                .build();

        expense = expenseRepository.save(expense);
        return mapToResponse(expense);
    }

    public List<ExpenseResponse> getExpensesByTrip(Long tripId) {
        return expenseRepository.findByTripIdOrderByExpenseDateDesc(tripId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void deleteExpense(Long expenseId, String userEmail) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        // Get user by email
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Only the person who paid or trip owner can delete
        if (!expense.getAddedBy().equals(user.getId())) {
            Trip trip = expense.getTrip();
            if (!trip.getOwnerId().equals(user.getId())) {
                throw new RuntimeException("Access denied");
            }
        }

        expenseRepository.delete(expense);
    }

    private ExpenseResponse mapToResponse(Expense expense) {
        User addedByUser = userRepository.findById(expense.getAddedBy()).orElse(null);
        ExpenseResponse.PaidByDto addedByDto = null;
        
        if (addedByUser != null) {
            addedByDto = ExpenseResponse.PaidByDto.builder()
                    .id(addedByUser.getId())
                    .name(addedByUser.getName())
                    .email(addedByUser.getEmail())
                    .avatar(addedByUser.getAvatar())
                    .build();
        }

        return ExpenseResponse.builder()
                .id(expense.getId())
                .tripId(expense.getTrip().getId())
                .paidBy(expense.getAddedBy())
                .paidByUser(addedByDto)
                .description(expense.getDescription())
                .amount(expense.getAmount())
                .currency(expense.getCurrency())
                .category(expense.getCategory())
                .expenseDate(expense.getExpenseDate())
                .createdAt(expense.getCreatedAt())
                .updatedAt(expense.getUpdatedAt())
                .build();
    }
}
