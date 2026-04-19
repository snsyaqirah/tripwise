package com.tripwise.dto.trip;

import com.tripwise.entity.Trip;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreateTripRequest {
    
    @NotBlank(message = "Trip name is required")
    @Size(max = 255, message = "Trip name cannot exceed 255 characters")
    private String name;
    
    @NotBlank(message = "Destination country is required")
    @Size(min = 2, max = 2, message = "Country code must be 2 characters")
    private String destinationCountry;
    
    @NotNull(message = "Start date is required")
    private LocalDate startDate;
    
    @NotNull(message = "End date is required")
    private LocalDate endDate;
    
    private String description;
    
    private String image;
    
    @NotNull(message = "Budget is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Budget must be greater than 0")
    private BigDecimal budget;
    
    @NotBlank(message = "Currency is required")
    @Size(min = 3, max = 3, message = "Currency code must be 3 characters")
    private String currency;
    
    private String budgetType = "solo";
    
    private String notes;
    
    private Trip.TripStatus status = Trip.TripStatus.PLANNED;
}
