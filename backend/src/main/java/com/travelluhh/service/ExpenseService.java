package com.travelluhh.service;

import com.travelluhh.dto.expense.CreateExpenseRequest;
import com.travelluhh.dto.expense.ExpenseResponse;
import com.travelluhh.entity.Expense;
import com.travelluhh.entity.ExpenseSubItem;
import com.travelluhh.entity.Trip;
import com.travelluhh.entity.User;
import com.travelluhh.repository.ExpenseRepository;
import com.travelluhh.repository.ExpenseSubItemRepository;
import com.travelluhh.repository.TripRepository;
import com.travelluhh.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseSubItemRepository subItemRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;

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
        try {
            activityService.logExpenseAdded(trip.getId(), user.getId(), user.getName(),
                    request.getDescription(), request.getAmount(), request.getCurrency());
        } catch (Exception ignored) {}

        if (request.getSubItems() != null && !request.getSubItems().isEmpty()) {
            final Long expenseId = expense.getId();
            List<ExpenseSubItem> subItems = request.getSubItems().stream()
                    .map(s -> ExpenseSubItem.builder()
                            .expenseId(expenseId)
                            .description(s.getDescription())
                            .amount(s.getAmount())
                            .category(s.getCategory())
                            .build())
                    .collect(Collectors.toList());
            subItemRepository.saveAll(subItems);
        }

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

        try {
            activityService.logExpenseDeleted(expense.getTrip().getId(), user.getId(), user.getName(), expense.getDescription());
        } catch (Exception ignored) {}
        expenseRepository.delete(expense);
    }

    private ExpenseResponse mapToResponse(Expense expense) {
        User addedByUser = expense.getAddedBy() != null
                ? userRepository.findById(expense.getAddedBy()).orElse(null)
                : null;

        ExpenseResponse.PaidByDto addedByDto = null;
        if (addedByUser != null) {
            addedByDto = ExpenseResponse.PaidByDto.builder()
                    .id(addedByUser.getId())
                    .name(addedByUser.getName())
                    .email(addedByUser.getEmail())
                    .avatar(addedByUser.getAvatar())
                    .build();
        }

        List<ExpenseResponse.SubItemDto> subItemDtos = subItemRepository.findByExpenseId(expense.getId())
                .stream()
                .map(s -> ExpenseResponse.SubItemDto.builder()
                        .id(s.getId())
                        .description(s.getDescription())
                        .amount(s.getAmount())
                        .category(s.getCategory())
                        .build())
                .collect(Collectors.toList());

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
                .subItems(subItemDtos.isEmpty() ? Collections.emptyList() : subItemDtos)
                .createdAt(expense.getCreatedAt())
                .updatedAt(expense.getUpdatedAt())
                .build();
    }
}
