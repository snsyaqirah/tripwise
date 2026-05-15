package com.travelluhh.controller;

import com.travelluhh.dto.itinerary.ItineraryItemRequest;
import com.travelluhh.dto.itinerary.ItineraryItemResponse;
import com.travelluhh.service.ItineraryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips/{tripId}/itinerary")
@RequiredArgsConstructor
public class ItineraryController {

    private final ItineraryService itineraryService;

    @GetMapping
    public ResponseEntity<List<ItineraryItemResponse>> getItems(@PathVariable Long tripId) {
        return ResponseEntity.ok(itineraryService.getItems(tripId));
    }

    @PostMapping
    public ResponseEntity<ItineraryItemResponse> addItem(
            @PathVariable Long tripId,
            @Valid @RequestBody ItineraryItemRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(itineraryService.addItem(tripId, request));
    }

    @PutMapping("/{itemId}")
    public ResponseEntity<ItineraryItemResponse> updateItem(
            @PathVariable Long itemId,
            @Valid @RequestBody ItineraryItemRequest request
    ) {
        return ResponseEntity.ok(itineraryService.updateItem(itemId, request));
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long itemId) {
        itineraryService.deleteItem(itemId);
        return ResponseEntity.noContent().build();
    }
}
