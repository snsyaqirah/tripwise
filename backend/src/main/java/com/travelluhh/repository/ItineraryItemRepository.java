package com.travelluhh.repository;

import com.travelluhh.entity.ItineraryItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ItineraryItemRepository extends JpaRepository<ItineraryItem, Long> {
    List<ItineraryItem> findByTripIdOrderByItemDateAscStartTimeAsc(Long tripId);
}
