package com.travelluhh.controller;

import com.travelluhh.entity.TripActivity;
import com.travelluhh.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips/{tripId}/activity")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @GetMapping
    public ResponseEntity<List<TripActivity>> getActivities(@PathVariable Long tripId) {
        return ResponseEntity.ok(activityService.getActivities(tripId));
    }
}
