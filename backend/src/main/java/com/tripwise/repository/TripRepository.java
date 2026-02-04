package com.tripwise.repository;

import com.tripwise.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    
    List<Trip> findByOwnerId(Long ownerId);
    
    @Query("SELECT DISTINCT t FROM Trip t LEFT JOIN t.members m " +
           "WHERE t.ownerId = :userId OR m.userId = :userId " +
           "ORDER BY t.startDate DESC")
    List<Trip> findAllTripsForUser(@Param("userId") Long userId);
    
    @Query("SELECT DISTINCT t FROM Trip t LEFT JOIN t.members m " +
           "WHERE (t.ownerId = :userId OR m.userId = :userId) " +
           "AND t.isArchived = false " +
           "ORDER BY t.startDate DESC")
    List<Trip> findActiveTripsForUser(@Param("userId") Long userId);
}
