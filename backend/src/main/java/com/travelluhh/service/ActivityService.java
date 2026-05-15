package com.travelluhh.service;

import com.travelluhh.entity.TripActivity;
import com.travelluhh.repository.TripActivityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final TripActivityRepository activityRepository;

    public List<TripActivity> getActivities(Long tripId) {
        return activityRepository.findByTripIdOrderByCreatedAtDesc(tripId);
    }

    @Async
    public void log(Long tripId, Long userId, String actorName, String actionType, String description) {
        activityRepository.save(TripActivity.builder()
                .tripId(tripId)
                .userId(userId)
                .actorName(actorName)
                .actionType(actionType)
                .description(description)
                .build());
    }

    public void logExpenseAdded(Long tripId, Long userId, String actorName, String expenseDesc, BigDecimal amount, String currency) {
        log(tripId, userId, actorName, "expense_added",
                actorName + " added " + currency + " " + amount.toPlainString() + " for \"" + expenseDesc + "\"");
    }

    public void logExpenseDeleted(Long tripId, Long userId, String actorName, String expenseDesc) {
        log(tripId, userId, actorName, "expense_deleted",
                actorName + " removed expense \"" + expenseDesc + "\"");
    }

    public void logMemberJoined(Long tripId, Long userId, String memberName) {
        log(tripId, userId, memberName, "member_joined", memberName + " joined the trip");
    }

    public void logTripUpdated(Long tripId, Long userId, String actorName) {
        log(tripId, userId, actorName, "trip_updated", actorName + " updated trip details");
    }
}
