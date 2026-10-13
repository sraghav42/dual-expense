package com.dualexpense;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

import com.dualexpense.dto.ExpenseResponse;
import com.dualexpense.model.Category;
import com.dualexpense.model.Expense;
import com.dualexpense.model.User;
import com.dualexpense.repository.CategoryRepository;
import com.dualexpense.repository.ExpenseRepository;
import com.dualexpense.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class ExpenseControllerTest {

    @Autowired
    private MockMvc mockMvc;

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

        userRepository.saveAll(List.of(
            new User("User 1", "#6366F1"),
            new User("User 2", "#14B8A6")
        ));

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
    }

    @Test
    void readinessReportsDatabaseAvailability() throws Exception {
        mockMvc.perform(get("/actuator/health/readiness"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void categoriesIncludeTheirIconIdentifiers() throws Exception {
        mockMvc.perform(get("/api/v1/categories"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[?(@.name == 'Groceries')].iconIdentifier").value(org.hamcrest.Matchers.hasItem("shopping-basket")));
    }

    @Test
    void createExpenseAndListByMonth() throws Exception {
        User user = userRepository.findByName("User 1").orElseThrow();
        Category category = categoryRepository.findByName("Groceries").orElseThrow();

        mockMvc.perform(post("/api/v1/expenses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(String.format("{" +
                        "\"amount\":\"87.25\"," +
                        "\"expenseDate\":\"%s\"," +
                        "\"payerId\":%d," +
                        "\"categoryId\":%d," +
                        "\"description\":\"Bakery\"" +
                        "}", LocalDate.now().minusDays(1), user.getId(), category.getId())))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.amount").value(87.25))
            .andExpect(jsonPath("$.payerName").value("User 1"));

        mockMvc.perform(get("/api/v1/expenses")
                .param("month", YearMonth.now().toString()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].description").value("Bakery"));
    }

    @Test
    void summaryReturnsHouseholdTotals() throws Exception {
        User userOne = userRepository.findByName("User 1").orElseThrow();
        User userTwo = userRepository.findByName("User 2").orElseThrow();
        Category groceries = categoryRepository.findByName("Groceries").orElseThrow();
        Category rent = categoryRepository.findByName("Housing/Rent").orElseThrow();

        expenseRepository.save(new Expense(BigDecimal.valueOf(45.00), LocalDate.now().minusDays(2), userOne, groceries, "Milk"));
        expenseRepository.save(new Expense(BigDecimal.valueOf(120.00), LocalDate.now().minusDays(1), userTwo, rent, "Rent"));

        mockMvc.perform(get("/api/v1/dashboard/summary")
                .param("month", YearMonth.now().toString()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.householdTotal").value(165.00))
            .andExpect(jsonPath("$.userTotals[0].userName").value("User 1"))
            .andExpect(jsonPath("$.userTotals[1].userName").value("User 2"));
    }

    @Test
    void deleteExpenseRemovesExpense() throws Exception {
        User user = userRepository.findByName("User 1").orElseThrow();
        Category groceries = categoryRepository.findByName("Groceries").orElseThrow();
        Expense saved = expenseRepository.save(new Expense(BigDecimal.valueOf(25.00), LocalDate.now().minusDays(3), user, groceries, "Bread"));

        mockMvc.perform(delete("/api/v1/expenses/{id}", saved.getId()))
            .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/expenses")
                .param("month", YearMonth.now().toString()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void deleteExpenseReturnsNotFoundForUnknownExpense() throws Exception {
        mockMvc.perform(delete("/api/v1/expenses/{id}", 999999L))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.error").value("Expense not found"));
    }

    @Test
    void rejectsMalformedAndFutureMonths() throws Exception {
        mockMvc.perform(get("/api/v1/dashboard/summary")
                .param("month", "2024/02"))
            .andExpect(status().isBadRequest());

        mockMvc.perform(get("/api/v1/expenses")
                .param("month", YearMonth.now().plusMonths(1).toString()))
            .andExpect(status().isBadRequest());
    }
}
