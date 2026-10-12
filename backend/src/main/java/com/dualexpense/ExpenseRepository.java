package com.dualexpense;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByExpenseDateBetweenOrderByExpenseDateDescIdDesc(LocalDate start, LocalDate end);
}
