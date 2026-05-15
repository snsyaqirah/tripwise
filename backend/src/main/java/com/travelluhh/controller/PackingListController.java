package com.travelluhh.controller;

import com.travelluhh.dto.packing.PackingItemRequest;
import com.travelluhh.dto.packing.PackingItemResponse;
import com.travelluhh.service.PackingListService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips/{tripId}/packing")
@RequiredArgsConstructor
public class PackingListController {

    private final PackingListService packingListService;

    @GetMapping
    public ResponseEntity<List<PackingItemResponse>> getItems(@PathVariable Long tripId) {
        return ResponseEntity.ok(packingListService.getItems(tripId));
    }

    @PostMapping
    public ResponseEntity<PackingItemResponse> addItem(
            @PathVariable Long tripId,
            @Valid @RequestBody PackingItemRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(packingListService.addItem(tripId, request, authentication.getName()));
    }

    @PatchMapping("/{itemId}/toggle")
    public ResponseEntity<PackingItemResponse> toggleItem(@PathVariable Long itemId) {
        return ResponseEntity.ok(packingListService.toggleItem(itemId));
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long itemId) {
        packingListService.deleteItem(itemId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/preset")
    public ResponseEntity<List<PackingItemResponse>> addPreset(
            @PathVariable Long tripId,
            @RequestParam(defaultValue = "general") String type,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(packingListService.addPreset(tripId, type, authentication.getName()));
    }
}
