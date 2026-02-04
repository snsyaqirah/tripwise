package com.tripwise.controller;

import com.tripwise.dto.trip.CreateTripRequest;
import com.tripwise.dto.trip.TripResponse;
import com.tripwise.dto.trip.UpdateTripRequest;
import com.tripwise.service.TripService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    @PostMapping
    public ResponseEntity<TripResponse> createTrip(
            @Valid @RequestBody CreateTripRequest request,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        TripResponse response = tripService.createTrip(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<TripResponse>> getAllTrips(Authentication authentication) {
        String userId = authentication.getName();
        List<TripResponse> trips = tripService.getAllTripsForUser(userId);
        return ResponseEntity.ok(trips);
    }

    @GetMapping("/{tripId}")
    public ResponseEntity<TripResponse> getTripById(
            @PathVariable Long tripId,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        TripResponse trip = tripService.getTripById(tripId, userId);
        return ResponseEntity.ok(trip);
    }

    @PutMapping("/{tripId}")
    public ResponseEntity<TripResponse> updateTrip(
            @PathVariable Long tripId,
            @Valid @RequestBody UpdateTripRequest request,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        TripResponse trip = tripService.updateTrip(tripId, request, userId);
        return ResponseEntity.ok(trip);
    }

    @DeleteMapping("/{tripId}")
    public ResponseEntity<Void> deleteTrip(
            @PathVariable Long tripId,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        tripService.deleteTrip(tripId, userId);
        return ResponseEntity.noContent().build();
    }
}
