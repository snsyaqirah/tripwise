package com.travelluhh.dto.itinerary;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItineraryItemResponse {
    private Long id;
    private Long tripId;
    private LocalDate itemDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String title;
    private String description;
    private String location;
    private String category;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
