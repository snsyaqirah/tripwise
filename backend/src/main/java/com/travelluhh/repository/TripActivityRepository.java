package com.travelluhh.repository;

import com.travelluhh.entity.TripActivity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TripActivityRepository extends JpaRepository<TripActivity, Long> {
    List<TripActivity> findByTripIdOrderByCreatedAtDesc(Long tripId);
}
