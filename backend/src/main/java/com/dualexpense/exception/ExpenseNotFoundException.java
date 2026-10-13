package com.dualexpense.exception;

public class ExpenseNotFoundException extends IllegalArgumentException {
    public ExpenseNotFoundException(String message) {
        super(message);
    }
}
