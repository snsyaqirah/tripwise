package com.travelluhh.repository;

import com.travelluhh.entity.PackingItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PackingItemRepository extends JpaRepository<PackingItem, Long> {
    List<PackingItem> findByTripIdOrderByCreatedAtAsc(Long tripId);
    void deleteByTripId(Long tripId);
}
