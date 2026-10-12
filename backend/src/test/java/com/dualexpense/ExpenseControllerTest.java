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

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
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
            new Category("Groceries"),
            new Category("Housing/Rent"),
            new Category("Utilities"),
            new Category("Dining"),
            new Category("Transport"),
            new Category("Entertainment"),
            new Category("Subscriptions"),
            new Category("Other")
        ));
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
}
