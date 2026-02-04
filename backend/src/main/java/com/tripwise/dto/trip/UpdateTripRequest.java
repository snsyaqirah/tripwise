package com.tripwise.dto.trip;

import com.tripwise.entity.Trip;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class UpdateTripRequest {
    
    @Size(max = 255, message = "Trip name cannot exceed 255 characters")
    private String name;
    
    @Size(min = 2, max = 2, message = "Country code must be 2 characters")
    private String destinationCountry;
    
    private LocalDate startDate;
    
    private LocalDate endDate;
    
    private String description;
    
    private String image;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "Budget must be greater than 0")
    private BigDecimal budget;
    
    @Size(min = 3, max = 3, message = "Currency code must be 3 characters")
    private String currency;
    
    private String budgetType;
    
    private String notes;
    
    private Trip.TripStatus status;
    
    private Boolean isArchived;
}
