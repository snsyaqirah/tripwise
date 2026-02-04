package com.tripwise.repository;

import com.tripwise.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    
    List<Expense> findByTripId(Long tripId);
    
    List<Expense> findByTripIdOrderByExpenseDateDesc(Long tripId);
}
