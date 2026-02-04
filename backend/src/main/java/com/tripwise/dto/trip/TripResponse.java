package com.tripwise.dto.trip;

import com.tripwise.entity.Trip;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripResponse {
    
    private Long id;
    private Long ownerId;
    private OwnerDto owner;
    private String name;
    private String destinationCountry;
    private LocalDate startDate;
    private LocalDate endDate;
    private String description;
    private String image;
    private BigDecimal budget;
    private String currency;
    private String budgetType;
    private String notes;
    private Trip.TripStatus status;
    private Boolean isArchived;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<MemberDto> members;
    private Integer memberCount;
    private BigDecimal totalExpenses;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OwnerDto {
        private Long id;
        private String name;
        private String email;
        private String avatar;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemberDto {
        private Long id;
        private Long userId;
        private String name;
        private String email;
        private String avatar;
        private String role;
        private Boolean isDeleted;
        private LocalDateTime joinedAt;
    }
}
