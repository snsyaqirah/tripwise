package com.travelluhh.repository;

import com.travelluhh.entity.ExpenseSubItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExpenseSubItemRepository extends JpaRepository<ExpenseSubItem, Long> {
    List<ExpenseSubItem> findByExpenseId(Long expenseId);
    void deleteByExpenseId(Long expenseId);
}
