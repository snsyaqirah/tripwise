package com.travelluhh.service;

import com.travelluhh.dto.itinerary.ItineraryItemRequest;
import com.travelluhh.dto.itinerary.ItineraryItemResponse;
import com.travelluhh.entity.ItineraryItem;
import com.travelluhh.repository.ItineraryItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ItineraryService {

    private final ItineraryItemRepository itineraryItemRepository;

    public List<ItineraryItemResponse> getItems(Long tripId) {
        return itineraryItemRepository.findByTripIdOrderByItemDateAscStartTimeAsc(tripId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ItineraryItemResponse addItem(Long tripId, ItineraryItemRequest request) {
        ItineraryItem item = ItineraryItem.builder()
                .tripId(tripId)
                .itemDate(request.getItemDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .title(request.getTitle())
                .description(request.getDescription())
                .location(request.getLocation())
                .category(request.getCategory())
                .build();
        return toResponse(itineraryItemRepository.save(item));
    }

    public ItineraryItemResponse updateItem(Long itemId, ItineraryItemRequest request) {
        ItineraryItem item = itineraryItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        item.setItemDate(request.getItemDate());
        item.setStartTime(request.getStartTime());
        item.setEndTime(request.getEndTime());
        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setLocation(request.getLocation());
        item.setCategory(request.getCategory());
        return toResponse(itineraryItemRepository.save(item));
    }

    public void deleteItem(Long itemId) {
        itineraryItemRepository.deleteById(itemId);
    }

    private ItineraryItemResponse toResponse(ItineraryItem item) {
        return ItineraryItemResponse.builder()
                .id(item.getId())
                .tripId(item.getTripId())
                .itemDate(item.getItemDate())
                .startTime(item.getStartTime())
                .endTime(item.getEndTime())
                .title(item.getTitle())
                .description(item.getDescription())
                .location(item.getLocation())
                .category(item.getCategory())
                .sortOrder(item.getSortOrder())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
