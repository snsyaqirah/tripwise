package com.tripwise.service;

import com.tripwise.dto.trip.CreateTripRequest;
import com.tripwise.dto.trip.TripResponse;
import com.tripwise.dto.trip.UpdateTripRequest;
import com.tripwise.entity.Trip;
import com.tripwise.entity.TripMember;
import com.tripwise.entity.User;
import com.tripwise.repository.ExpenseRepository;
import com.tripwise.repository.TripMemberRepository;
import com.tripwise.repository.TripRepository;
import com.tripwise.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TripService {

    private final TripRepository tripRepository;
    private final TripMemberRepository tripMemberRepository;
    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public TripResponse createTrip(CreateTripRequest request, String userEmail) {
        // Validate dates
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("End date must be after start date");
        }

        // Get user by email (authentication.getName() returns email, not ID)
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        Long userId = user.getId();

        // Create trip
        Trip trip = Trip.builder()
                .ownerId(userId)
                .name(request.getName())
                .destinationCountry(request.getDestinationCountry())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .description(request.getDescription())
                .image(request.getImage())
                .budget(request.getBudget())
                .currency(request.getCurrency())
                .budgetType(request.getBudgetType())
                .notes(request.getNotes())
                .status(request.getStatus())
                .isArchived(false)
                .build();

        trip = tripRepository.save(trip);

        // Add owner as member
        TripMember ownerMember = TripMember.builder()
                .trip(trip)
                .userId(userId)
                .role(TripMember.MemberRole.owner)
                .isDeleted(false)
                .build();
        
        tripMemberRepository.save(ownerMember);

        return mapToResponse(trip);
    }

    public List<TripResponse> getAllTripsForUser(String userEmail) {
        // Get user by email first
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        List<Trip> trips = tripRepository.findActiveTripsForUser(user.getId());
        return trips.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public TripResponse getTripById(Long tripId, String userEmail) {
        // Get user by email first
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        // Verify user has access to this trip
        if (!trip.getOwnerId().equals(user.getId()) && 
            !tripMemberRepository.existsByTripIdAndUserId(tripId, user.getId())) {
            throw new RuntimeException("Access denied");
        }

        return mapToResponse(trip);
    }

    public TripResponse updateTrip(Long tripId, UpdateTripRequest request, String userEmail) {
        // Get user by email first
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        // Only owner or editor members can update
        if (!trip.getOwnerId().equals(user.getId())) {
            TripMember member = tripMemberRepository.findByTripIdAndUserId(tripId, user.getId())
                    .orElseThrow(() -> new RuntimeException("Access denied"));
            if (member.getRole() != TripMember.MemberRole.editor) {
                throw new RuntimeException("Only owner or editor can update trip");
            }
        }

        // Update fields if provided
        if (request.getName() != null) trip.setName(request.getName());
        if (request.getDestinationCountry() != null) trip.setDestinationCountry(request.getDestinationCountry());
        if (request.getStartDate() != null) trip.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) trip.setEndDate(request.getEndDate());
        if (request.getDescription() != null) trip.setDescription(request.getDescription());
        if (request.getImage() != null) trip.setImage(request.getImage());
        if (request.getBudget() != null) trip.setBudget(request.getBudget());
        if (request.getCurrency() != null) trip.setCurrency(request.getCurrency());
        if (request.getBudgetType() != null) trip.setBudgetType(request.getBudgetType());
        if (request.getNotes() != null) trip.setNotes(request.getNotes());
        if (request.getStatus() != null) trip.setStatus(request.getStatus());
        if (request.getIsArchived() != null) trip.setIsArchived(request.getIsArchived());

        trip = tripRepository.save(trip);
        return mapToResponse(trip);
    }

    public void deleteTrip(Long tripId, String userEmail) {
        // Get user by email first
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        // Only owner can delete
        if (!trip.getOwnerId().equals(user.getId())) {
            throw new RuntimeException("Only the owner can delete the trip");
        }

        tripRepository.delete(trip);
    }

    private boolean canAccessTrip(Trip trip, Long userId) {
        return trip.getOwnerId().equals(userId) || 
               tripMemberRepository.existsByTripIdAndUserId(trip.getId(), userId);
    }

    private boolean canEditTrip(Trip trip, Long userId) {
        if (trip.getOwnerId().equals(userId)) {
            return true;
        }
        
        return tripMemberRepository.findByTripIdAndUserId(trip.getId(), userId)
                .map(member -> member.getRole() == TripMember.MemberRole.editor || 
                              member.getRole() == TripMember.MemberRole.owner)
                .orElse(false);
    }

    private TripResponse mapToResponse(Trip trip) {
        // Get owner details
        User owner = userRepository.findById(trip.getOwnerId()).orElse(null);
        TripResponse.OwnerDto ownerDto = null;
        if (owner != null) {
            ownerDto = TripResponse.OwnerDto.builder()
                    .id(owner.getId())
                    .name(owner.getName())
                    .email(owner.getEmail())
                    .avatar(owner.getAvatar())
                    .build();
        }

        // Get members
        List<TripMember> members = tripMemberRepository.findByTripId(trip.getId());
        List<TripResponse.MemberDto> memberDtos = members.stream()
                .map(member -> {
                    User memberUser = userRepository.findById(member.getUserId()).orElse(null);
                    return TripResponse.MemberDto.builder()
                            .id(member.getId())
                            .userId(member.getUserId())
                            .name(memberUser != null ? memberUser.getName() : null)
                            .email(memberUser != null ? memberUser.getEmail() : null)
                            .avatar(memberUser != null ? memberUser.getAvatar() : null)
                            .role(member.getRole().name())
                            .isDeleted(member.getIsDeleted())
                            .joinedAt(member.getJoinedAt())
                            .build();
                })
                .collect(Collectors.toList());

        // Calculate total expenses
        BigDecimal totalExpenses = expenseRepository.findByTripId(trip.getId())
                .stream()
                .map(expense -> expense.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return TripResponse.builder()
                .id(trip.getId())
                .ownerId(trip.getOwnerId())
                .owner(ownerDto)
                .name(trip.getName())
                .destinationCountry(trip.getDestinationCountry())
                .startDate(trip.getStartDate())
                .endDate(trip.getEndDate())
                .description(trip.getDescription())
                .image(trip.getImage())
                .budget(trip.getBudget())
                .currency(trip.getCurrency())
                .budgetType(trip.getBudgetType())
                .notes(trip.getNotes())
                .status(trip.getStatus())
                .isArchived(trip.getIsArchived())
                .createdAt(trip.getCreatedAt())
                .updatedAt(trip.getUpdatedAt())
                .members(memberDtos)
                .memberCount(memberDtos.size())
                .totalExpenses(totalExpenses)
                .build();
    }
}
