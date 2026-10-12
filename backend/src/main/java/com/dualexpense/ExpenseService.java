package com.dualexpense;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ExpenseService {
    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public ExpenseService(ExpenseRepository expenseRepository, UserRepository userRepository, CategoryRepository categoryRepository) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public Expense createExpense(BigDecimal amount, LocalDate expenseDate, Long payerId, Long categoryId, String description) {
        validateExpense(amount, expenseDate, payerId, categoryId, description);

        User payer = userRepository.findById(payerId)
            .orElseThrow(() -> new IllegalArgumentException("Invalid payer"));
        Category category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new IllegalArgumentException("Invalid category"));

        return expenseRepository.save(new Expense(amount, expenseDate, payer, category, description));
    }

    @Transactional(readOnly = true)
    public DashboardSummary getSummaryForMonth(int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        List<Expense> expenses = expenseRepository.findByExpenseDateBetweenOrderByExpenseDateDescIdDesc(start, end);
        BigDecimal householdTotal = expenses.stream()
            .map(Expense::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<Long, BigDecimal> userTotals = expenses.stream()
            .collect(Collectors.groupingBy(expense -> expense.getPayer().getId(),
                Collectors.mapping(Expense::getAmount, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))));

        List<UserTotal> userSummary = userRepository.findAll().stream()
            .map(user -> new UserTotal(user.getId(), user.getName(), userTotals.getOrDefault(user.getId(), BigDecimal.ZERO)))
            .sorted(Comparator.comparing(UserTotal::userName))
            .toList();

        List<UserTopCategory> topCategories = new ArrayList<>();
        for (User user : userRepository.findAll()) {
            Map<String, BigDecimal> categoryTotals = expenses.stream()
                .filter(expense -> expense.getPayer().getId().equals(user.getId()))
                .collect(Collectors.groupingBy(expense -> expense.getCategory().getName(),
                    Collectors.mapping(Expense::getAmount, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))));

            if (!categoryTotals.isEmpty()) {
                var top = categoryTotals.entrySet().stream()
                    .max(Comparator.comparing(Map.Entry::getValue))
                    .orElseThrow();
                topCategories.add(new UserTopCategory(user.getId(), user.getName(), top.getKey(), top.getValue()));
            }
        }

        return new DashboardSummary(householdTotal, userSummary, topCategories);
    }

    @Transactional(readOnly = true)
    public List<Expense> getExpensesForMonth(int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        return expenseRepository.findByExpenseDateBetweenOrderByExpenseDateDescIdDesc(start, end);
    }

    @Transactional
    public void deleteExpense(Long expenseId) {
        if (!expenseRepository.existsById(expenseId)) {
            throw new IllegalArgumentException("Expense not found");
        }
        expenseRepository.deleteById(expenseId);
    }

    private void validateExpense(BigDecimal amount, LocalDate expenseDate, Long payerId, Long categoryId, String description) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
        if (amount.scale() > 2) {
            throw new IllegalArgumentException("Amount must have at most two decimal places");
        }
        if (expenseDate == null || expenseDate.isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Expense date must be today or earlier");
        }
        if (payerId == null || !userRepository.existsById(payerId)) {
            throw new IllegalArgumentException("Invalid payer");
        }
        if (categoryId == null || !categoryRepository.existsById(categoryId)) {
            throw new IllegalArgumentException("Invalid category");
        }
        if (description != null && description.length() > 255) {
            throw new IllegalArgumentException("Description must be 255 characters or fewer");
        }
    }
}
