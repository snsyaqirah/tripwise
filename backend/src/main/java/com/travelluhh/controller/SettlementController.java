package com.travelluhh.controller;

import com.travelluhh.dto.trip.SettlementResponse;
import com.travelluhh.service.SettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trips/{tripId}/settlement")
@RequiredArgsConstructor
public class SettlementController {

    private final SettlementService settlementService;

    @GetMapping
    public ResponseEntity<SettlementResponse> getSettlement(@PathVariable Long tripId) {
        return ResponseEntity.ok(settlementService.calculate(tripId));
    }
}
