package com.travelluhh.dto.packing;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PackingItemResponse {
    private Long id;
    private Long tripId;
    private String label;
    private String category;
    private Boolean isChecked;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
