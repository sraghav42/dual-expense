package com.dualexpense.repository;

import java.time.LocalDate;
import java.util.List;

import com.dualexpense.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByExpenseDateBetweenOrderByExpenseDateDescIdDesc(LocalDate start, LocalDate end);
}
