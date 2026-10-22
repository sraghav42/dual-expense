package com.dualexpense.service;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import com.dualexpense.dto.DashboardSummary;
import com.dualexpense.dto.DashboardSummary.UserTopCategory;
import com.dualexpense.dto.DashboardSummary.UserTotal;
import com.dualexpense.exception.ExpenseNotFoundException;
import com.dualexpense.model.Category;
import com.dualexpense.model.Expense;
import com.dualexpense.model.User;
import com.dualexpense.repository.CategoryRepository;
import com.dualexpense.repository.ExpenseRepository;
import com.dualexpense.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ExpenseService {
    private static final Logger logger = LoggerFactory.getLogger(ExpenseService.class);

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final Clock clock;

    public ExpenseService(ExpenseRepository expenseRepository, UserRepository userRepository, CategoryRepository categoryRepository, Clock clock) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.clock = clock;
    }

    @Transactional
    public Expense createExpense(BigDecimal amount, LocalDate expenseDate, Long payerId, Long categoryId, String description) {
        validateExpense(amount, expenseDate, payerId, categoryId, description);

        User payer = userRepository.findById(payerId)
            .orElseThrow(() -> new IllegalArgumentException("Invalid payer"));
        Category category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new IllegalArgumentException("Invalid category"));

        Expense created = expenseRepository.save(new Expense(amount, expenseDate, payer, category, description));
        logger.info("Created expense id={}", created.getId());
        return created;
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

        List<User> users = userRepository.findAll().stream()
            .sorted(Comparator.comparing(User::getName))
            .toList();
        List<UserTotal> userSummary = users.stream()
            .map(user -> new UserTotal(user.getId(), user.getName(), userTotals.getOrDefault(user.getId(), BigDecimal.ZERO)))
            .toList();

        List<Category> orderedCategories = categoryRepository.findAllByOrderByDisplayOrderAscIdAsc();
        Map<String, Integer> categoryOrder = new java.util.HashMap<>();
        for (int index = 0; index < orderedCategories.size(); index++) {
            categoryOrder.put(orderedCategories.get(index).getName(), index);
        }

        List<UserTopCategory> topCategories = users.stream()
            .map(user -> {
                Map<String, BigDecimal> categoryTotals = expenses.stream()
                    .filter(expense -> expense.getPayer().getId().equals(user.getId()))
                    .collect(Collectors.groupingBy(expense -> expense.getCategory().getName(),
                        Collectors.mapping(Expense::getAmount, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))));

                if (categoryTotals.isEmpty()) {
                    return null;
                }

                Map.Entry<String, BigDecimal> top = categoryTotals.entrySet().stream()
                    .max(Comparator
                        .comparing((Map.Entry<String, BigDecimal> entry) -> entry.getValue())
                        .thenComparing(entry -> -categoryOrder.getOrDefault(entry.getKey(), Integer.MAX_VALUE)))
                    .orElse(null);

                if (top == null) {
                    return null;
                }

                return new UserTopCategory(user.getId(), user.getName(), top.getKey(), top.getValue());
            })
            .filter(Objects::nonNull)
            .toList();

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
            throw new ExpenseNotFoundException("Expense not found");
        }
        expenseRepository.deleteById(expenseId);
        logger.info("Deleted expense id={}", expenseId);
    }

    private void validateExpense(BigDecimal amount, LocalDate expenseDate, Long payerId, Long categoryId, String description) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
        if (amount.scale() > 2) {
            throw new IllegalArgumentException("Amount must have at most two decimal places");
        }
        if (expenseDate == null || expenseDate.isAfter(LocalDate.now(clock))) {
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
