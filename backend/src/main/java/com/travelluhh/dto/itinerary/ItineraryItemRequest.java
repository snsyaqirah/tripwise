package com.travelluhh.dto.itinerary;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class ItineraryItemRequest {
    @NotNull(message = "Date is required")
    private LocalDate itemDate;

    @NotBlank(message = "Title is required")
    private String title;

    private LocalTime startTime;
    private LocalTime endTime;
    private String description;
    private String location;
    private String category;
}
