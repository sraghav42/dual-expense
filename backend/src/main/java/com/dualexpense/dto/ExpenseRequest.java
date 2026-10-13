package com.dualexpense.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ExpenseRequest(
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", inclusive = true, message = "Amount must be positive")
    @Digits(integer = 10, fraction = 2, message = "Amount must have at most two decimal places")
    BigDecimal amount,

    @NotNull(message = "Expense date is required")
    LocalDate expenseDate,

    @NotNull(message = "Payer is required")
    Long payerId,

    @NotNull(message = "Category is required")
    Long categoryId,

    @Size(max = 255, message = "Description must be 255 characters or fewer")
    String description
) {
}
