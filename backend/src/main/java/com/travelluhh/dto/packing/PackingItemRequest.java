package com.travelluhh.dto.packing;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PackingItemRequest {
    @NotBlank(message = "Item label is required")
    private String label;
    private String category;
}
