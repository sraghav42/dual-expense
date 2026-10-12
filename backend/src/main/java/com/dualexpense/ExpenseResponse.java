package com.dualexpense;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseResponse(
    Long id,
    BigDecimal amount,
    LocalDate expenseDate,
    Long payerId,
    String payerName,
    Long categoryId,
    String categoryName,
    String description
) {
    public static ExpenseResponse from(Expense expense) {
        return new ExpenseResponse(
            expense.getId(),
            expense.getAmount(),
            expense.getExpenseDate(),
            expense.getPayer().getId(),
            expense.getPayer().getName(),
            expense.getCategory().getId(),
            expense.getCategory().getName(),
            expense.getDescription()
        );
    }
}
