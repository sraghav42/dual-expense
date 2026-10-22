package com.dualexpense;

import static org.assertj.core.api.Assertions.assertThat;
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
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ExtendWith(OutputCaptureExtension.class)
class ExpenseControllerTest {
    private static final String FIRST_USER_NAME = "Test User One";
    private static final String SECOND_USER_NAME = "Test User Two";

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
    void categoriesAreReturnedInDisplayOrderWithOtherLast() throws Exception {
        mockMvc.perform(get("/api/v1/categories"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(9))
            .andExpect(jsonPath("$[0].name").value("Groceries"))
            .andExpect(jsonPath("$[1].name").value("Housing/Rent"))
            .andExpect(jsonPath("$[2].name").value("Utilities"))
            .andExpect(jsonPath("$[3].name").value("Dining"))
            .andExpect(jsonPath("$[4].name").value("Transport"))
            .andExpect(jsonPath("$[5].name").value("Entertainment"))
            .andExpect(jsonPath("$[6].name").value("Health/Beauty"))
            .andExpect(jsonPath("$[7].name").value("Clothing"))
            .andExpect(jsonPath("$[8].name").value("Other"));
    }

    @Test
    void usersExposeNamesConfiguredAtStartup() throws Exception {
        mockMvc.perform(get("/api/v1/users"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].name").value(FIRST_USER_NAME))
            .andExpect(jsonPath("$[1].name").value(SECOND_USER_NAME));
    }

    @Test
    void createExpenseAndListByMonth() throws Exception {
        User user = userRepository.findByName(FIRST_USER_NAME).orElseThrow();
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
            .andExpect(jsonPath("$.payerName").value(FIRST_USER_NAME));

        mockMvc.perform(get("/api/v1/expenses")
                .param("month", YearMonth.now().toString()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].description").value("Bakery"));
    }

    @Test
    void logsApiRequestMetadataWithoutLoggingExpenseDetails(CapturedOutput output) throws Exception {
        User user = userRepository.findByName(FIRST_USER_NAME).orElseThrow();
        Category category = categoryRepository.findByName("Groceries").orElseThrow();
        String privateDescription = "private expense description";

        mockMvc.perform(post("/api/v1/expenses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(String.format("{" +
                        "\"amount\":\"87.25\"," +
                        "\"expenseDate\":\"%s\"," +
                        "\"payerId\":%d," +
                        "\"categoryId\":%d," +
                        "\"description\":\"%s\"" +
                        "}", LocalDate.now().minusDays(1), user.getId(), category.getId(), privateDescription)))
            .andExpect(status().isCreated());

        assertThat(output.getAll())
            .contains("API request method=POST path=/api/v1/expenses status=201 durationMs=")
            .contains("Created expense id=")
            .doesNotContain(privateDescription);
    }

    @Test
    void summaryReturnsHouseholdTotals() throws Exception {
        User userOne = userRepository.findByName(FIRST_USER_NAME).orElseThrow();
        User userTwo = userRepository.findByName(SECOND_USER_NAME).orElseThrow();
        Category groceries = categoryRepository.findByName("Groceries").orElseThrow();
        Category rent = categoryRepository.findByName("Housing/Rent").orElseThrow();

        expenseRepository.save(new Expense(BigDecimal.valueOf(45.00), LocalDate.now().minusDays(2), userOne, groceries, "Milk"));
        expenseRepository.save(new Expense(BigDecimal.valueOf(120.00), LocalDate.now().minusDays(1), userTwo, rent, "Rent"));

        mockMvc.perform(get("/api/v1/dashboard/summary")
                .param("month", YearMonth.now().toString()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.householdTotal").value(165.00))
                .andExpect(jsonPath("$.userTotals[0].userName").value(FIRST_USER_NAME))
                .andExpect(jsonPath("$.userTotals[1].userName").value(SECOND_USER_NAME));
    }

    @Test
    void deleteExpenseRemovesExpense() throws Exception {
        User user = userRepository.findByName(FIRST_USER_NAME).orElseThrow();
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
