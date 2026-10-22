package com.dualexpense;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.dualexpense.config.TimeConfig;
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
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;

@DataJpaTest
@Import({ExpenseService.class, ExpenseServiceTest.FixedClockConfig.class})
class ExpenseServiceTest {

    private static final Clock FIXED_CLOCK =
        Clock.fixed(LocalDateTime.of(2026, 6, 15, 12, 0).atZone(TimeConfig.HOUSEHOLD_ZONE).toInstant(), TimeConfig.HOUSEHOLD_ZONE);

    @TestConfiguration
    static class FixedClockConfig {
        @Bean
        Clock householdClock() {
            return FIXED_CLOCK;
        }
    }

    private static LocalDate today() {
        return LocalDate.now(FIXED_CLOCK);
    }

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
        userRepository.save(new User("User 3", "#F59E0B"));
        categoryRepository.saveAll(List.of(
            new Category("Groceries", "shopping-basket", 1),
            new Category("Housing/Rent", "house", 2),
            new Category("Utilities", "zap", 3),
            new Category("Dining", "utensils", 4),
            new Category("Transport", "car", 5),
            new Category("Entertainment", "popcorn", 6),
            new Category("Health/Beauty", "spa", 7),
            new Category("Clothing", "checkroom", 8),
            new Category("Other", "ellipsis", 9)
        ));

        expenseRepository.save(new Expense(BigDecimal.valueOf(45.00), today().minusDays(2), userOne, categoryRepository.findByName("Groceries").orElseThrow(), "Milk and eggs"));
        expenseRepository.save(new Expense(BigDecimal.valueOf(120.00), today().minusDays(1), userTwo, categoryRepository.findByName("Housing/Rent").orElseThrow(), "Rent"));
    }

    @Test
    void createExpenseAcceptsValidInput() {
        User user = userRepository.findByName("User 1").orElseThrow();
        Category category = categoryRepository.findByName("Groceries").orElseThrow();

        Expense saved = expenseService.createExpense(BigDecimal.valueOf(87.25), today(), user.getId(), category.getId(), "Bakery");

        assertThat(saved.getAmount()).isEqualByComparingTo("87.25");
        assertThat(saved.getPayer().getName()).isEqualTo("User 1");
        assertThat(saved.getCategory().getName()).isEqualTo("Groceries");
    }

    @Test
    void createExpenseUsesHouseholdEasternDateForFutureValidation() {
        User user = userRepository.findByName("User 1").orElseThrow();
        Category category = categoryRepository.findByName("Groceries").orElseThrow();

        // The fixed clock is 2026-06-15 12:00 in America/New_York, so June 15 is
        // "today" and must be accepted while June 16 is "tomorrow" and rejected.
        expenseService.createExpense(BigDecimal.valueOf(10.00), LocalDate.of(2026, 6, 15), user.getId(), category.getId(), "Eastern today");

        assertThatThrownBy(() -> expenseService.createExpense(BigDecimal.valueOf(10.00), LocalDate.of(2026, 6, 16), user.getId(), category.getId(), "Eastern tomorrow"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("today or earlier");
    }

    @Test
    void createExpenseRejectsInvalidAmount() {
        User user = userRepository.findByName("User 1").orElseThrow();
        Category category = categoryRepository.findByName("Dining").orElseThrow();

        assertThatThrownBy(() -> expenseService.createExpense(BigDecimal.ZERO, today(), user.getId(), category.getId(), "Bad"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("positive");
    }

    @Test
    void createExpenseRejectsFutureDatesAndLongDescriptions() {
        User user = userRepository.findByName("User 1").orElseThrow();
        Category category = categoryRepository.findByName("Groceries").orElseThrow();
        String longDescription = "x".repeat(256);

        assertThatThrownBy(() -> expenseService.createExpense(BigDecimal.valueOf(42.00), today().plusDays(1), user.getId(), category.getId(), "Soon"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("today or earlier");

        assertThatThrownBy(() -> expenseService.createExpense(BigDecimal.valueOf(42.00), today(), user.getId(), category.getId(), longDescription))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("255 characters or fewer");
    }

    @Test
    void summaryReturnsMonthlyTotals() {
        DashboardSummary summary = expenseService.getSummaryForMonth(today().getYear(), today().getMonthValue());

        assertThat(summary.householdTotal()).isEqualByComparingTo("165.00");
        assertThat(summary.userTotals()).hasSize(3);
        assertThat(summary.userTotals()).anyMatch(entry -> entry.userName().equals("User 1") && entry.total().compareTo(new BigDecimal("45.00")) == 0);
        assertThat(summary.userTotals()).anyMatch(entry -> entry.userName().equals("User 2") && entry.total().compareTo(new BigDecimal("120.00")) == 0);
        assertThat(summary.userTotals()).anyMatch(entry -> entry.userName().equals("User 3") && entry.total().compareTo(BigDecimal.ZERO) == 0);
    }

    @Test
    void summaryUsesSeededCategoryOrderWhenTopCategoriesTie() {
        User user = userRepository.findByName("User 1").orElseThrow();
        Category groceries = categoryRepository.findByName("Groceries").orElseThrow();
        Category rent = categoryRepository.findByName("Housing/Rent").orElseThrow();

        expenseRepository.save(new Expense(BigDecimal.valueOf(50.00), today().minusDays(4), user, groceries, "Produce"));
        expenseRepository.save(new Expense(BigDecimal.valueOf(50.00), today().minusDays(3), user, rent, "Rent-like"));

        DashboardSummary summary = expenseService.getSummaryForMonth(today().getYear(), today().getMonthValue());

        assertThat(summary.topCategories())
            .filteredOn(entry -> entry.userId().equals(user.getId()))
            .singleElement()
            .satisfies(entry -> assertThat(entry.categoryName()).isEqualTo("Groceries"));
    }

    @Test
    void summaryReturnsZeroAndNoTopCategoryForUsersWithNoExpenses() {
        DashboardSummary summary = expenseService.getSummaryForMonth(today().getYear(), today().getMonthValue());

        assertThat(summary.userTotals())
            .filteredOn(entry -> entry.userName().equals("User 3"))
            .singleElement()
            .satisfies(entry -> {
                assertThat(entry.total()).isZero();
            });
        assertThat(summary.topCategories()).noneMatch(entry -> entry.userName().equals("User 3"));
    }
}
