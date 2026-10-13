package com.dualexpense;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.dualexpense.dto.DashboardSummary;
import com.dualexpense.model.Category;
import com.dualexpense.model.Expense;
import com.dualexpense.model.User;
import com.dualexpense.repository.CategoryRepository;
import com.dualexpense.repository.ExpenseRepository;
import com.dualexpense.repository.UserRepository;
import com.dualexpense.service.ExpenseService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.context.annotation.Import;

@DataJpaTest
@Import(ExpenseService.class)
class ExpenseServiceTest {

    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @BeforeEach
    void setUp() {
        expenseRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();

        User userOne = userRepository.save(new User("User 1", "#6366F1"));
        User userTwo = userRepository.save(new User("User 2", "#14B8A6"));
        categoryRepository.saveAll(List.of(
            new Category("Groceries", "shopping-basket"),
            new Category("Housing/Rent", "house"),
            new Category("Utilities", "zap"),
            new Category("Dining", "utensils"),
            new Category("Transport", "car"),
            new Category("Entertainment", "popcorn"),
            new Category("Subscriptions", "repeat"),
            new Category("Other", "ellipsis")
        ));

        expenseRepository.save(new Expense(BigDecimal.valueOf(45.00), LocalDate.now().minusDays(2), userOne, categoryRepository.findByName("Groceries").orElseThrow(), "Milk and eggs"));
        expenseRepository.save(new Expense(BigDecimal.valueOf(120.00), LocalDate.now().minusDays(1), userTwo, categoryRepository.findByName("Housing/Rent").orElseThrow(), "Rent"));
    }

    @Test
    void createExpenseAcceptsValidInput() {
        User user = userRepository.findByName("User 1").orElseThrow();
        Category category = categoryRepository.findByName("Groceries").orElseThrow();

        Expense saved = expenseService.createExpense(BigDecimal.valueOf(87.25), LocalDate.now(), user.getId(), category.getId(), "Bakery");

        assertThat(saved.getAmount()).isEqualByComparingTo("87.25");
        assertThat(saved.getPayer().getName()).isEqualTo("User 1");
        assertThat(saved.getCategory().getName()).isEqualTo("Groceries");
    }

    @Test
    void createExpenseRejectsInvalidAmount() {
        User user = userRepository.findByName("User 1").orElseThrow();
        Category category = categoryRepository.findByName("Dining").orElseThrow();

        assertThatThrownBy(() -> expenseService.createExpense(BigDecimal.ZERO, LocalDate.now(), user.getId(), category.getId(), "Bad"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("positive");
    }

    @Test
    void createExpenseRejectsFutureDatesAndLongDescriptions() {
        User user = userRepository.findByName("User 1").orElseThrow();
        Category category = categoryRepository.findByName("Groceries").orElseThrow();
        String longDescription = "x".repeat(256);

        assertThatThrownBy(() -> expenseService.createExpense(BigDecimal.valueOf(42.00), LocalDate.now().plusDays(1), user.getId(), category.getId(), "Soon"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("today or earlier");

        assertThatThrownBy(() -> expenseService.createExpense(BigDecimal.valueOf(42.00), LocalDate.now(), user.getId(), category.getId(), longDescription))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("255 characters or fewer");
    }

    @Test
    void summaryReturnsMonthlyTotals() {
        DashboardSummary summary = expenseService.getSummaryForMonth(LocalDate.now().getYear(), LocalDate.now().getMonthValue());

        assertThat(summary.householdTotal()).isEqualByComparingTo("165.00");
        assertThat(summary.userTotals()).hasSize(2);
        assertThat(summary.userTotals()).anyMatch(entry -> entry.userName().equals("User 1") && entry.total().compareTo(new BigDecimal("45.00")) == 0);
        assertThat(summary.userTotals()).anyMatch(entry -> entry.userName().equals("User 2") && entry.total().compareTo(new BigDecimal("120.00")) == 0);
    }
}
