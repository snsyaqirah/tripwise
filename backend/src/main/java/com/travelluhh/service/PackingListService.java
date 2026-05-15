package com.travelluhh.service;

import com.travelluhh.dto.packing.PackingItemRequest;
import com.travelluhh.dto.packing.PackingItemResponse;
import com.travelluhh.entity.PackingItem;
import com.travelluhh.entity.User;
import com.travelluhh.repository.PackingItemRepository;
import com.travelluhh.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PackingListService {

    private final PackingItemRepository packingItemRepository;
    private final UserRepository userRepository;

    public List<PackingItemResponse> getItems(Long tripId) {
        return packingItemRepository.findByTripIdOrderByCreatedAtAsc(tripId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public PackingItemResponse addItem(Long tripId, PackingItemRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        PackingItem item = PackingItem.builder()
                .tripId(tripId)
                .addedBy(user.getId())
                .label(request.getLabel())
                .category(request.getCategory())
                .isChecked(false)
                .build();

        return toResponse(packingItemRepository.save(item));
    }

    public PackingItemResponse toggleItem(Long itemId) {
        PackingItem item = packingItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        item.setIsChecked(!item.getIsChecked());
        return toResponse(packingItemRepository.save(item));
    }

    public void deleteItem(Long itemId) {
        packingItemRepository.deleteById(itemId);
    }

    public List<PackingItemResponse> addPreset(Long tripId, String tripType, String userEmail) {
        String[][] presets = getPreset(tripType);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<PackingItem> items = java.util.Arrays.stream(presets)
                .map(p -> PackingItem.builder()
                        .tripId(tripId)
                        .addedBy(user.getId())
                        .label(p[0])
                        .category(p[1])
                        .isChecked(false)
                        .build())
                .collect(Collectors.toList());

        return packingItemRepository.saveAll(items).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    private String[][] getPreset(String type) {
        return switch (type.toLowerCase()) {
            case "beach" -> new String[][]{
                {"Sunscreen SPF 50+", "health"}, {"Swimwear", "clothing"},
                {"Beach towel", "gear"}, {"Flip flops", "clothing"},
                {"Sunglasses", "clothing"}, {"Snorkeling gear", "gear"},
                {"Waterproof bag", "gear"}, {"After-sun lotion", "health"}
            };
            case "hiking" -> new String[][]{
                {"Hiking boots", "clothing"}, {"Backpack", "gear"},
                {"Water bottle", "gear"}, {"First aid kit", "health"},
                {"Sunscreen", "health"}, {"Trail map / GPS", "gear"},
                {"Raincoat", "clothing"}, {"Headlamp", "gear"},
                {"Energy snacks", "food"}, {"Trekking poles", "gear"}
            };
            case "business" -> new String[][]{
                {"Business cards", "work"}, {"Laptop + charger", "electronics"},
                {"Formal attire", "clothing"}, {"Notebook & pen", "work"},
                {"Travel adapter", "electronics"}, {"Power bank", "electronics"},
                {"Dress shoes", "clothing"}, {"Portfolio/folder", "work"}
            };
            case "umrah", "hajj" -> new String[][]{
                {"Ihram", "clothing"}, {"Prayer mat", "religious"},
                {"Quran", "religious"}, {"Tasbih", "religious"},
                {"Comfortable walking shoes", "clothing"}, {"Sunscreen", "health"},
                {"Water bottle", "gear"}, {"Umbrella", "gear"},
                {"Medication", "health"}, {"Sandals", "clothing"}
            };
            default -> new String[][]{
                {"Passport & documents", "documents"}, {"Phone charger", "electronics"},
                {"Medications", "health"}, {"Clothes", "clothing"},
                {"Toiletries", "personal"}, {"Travel adapter", "electronics"},
                {"Power bank", "electronics"}, {"Snacks", "food"}
            };
        };
    }

    private PackingItemResponse toResponse(PackingItem item) {
        return PackingItemResponse.builder()
                .id(item.getId())
                .tripId(item.getTripId())
                .label(item.getLabel())
                .category(item.getCategory())
                .isChecked(item.getIsChecked())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
