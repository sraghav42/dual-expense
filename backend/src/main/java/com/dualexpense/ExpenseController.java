package com.dualexpense;

import java.time.YearMonth;
import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class ExpenseController {
    private final ExpenseService expenseService;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public ExpenseController(ExpenseService expenseService, UserRepository userRepository, CategoryRepository categoryRepository) {
        this.expenseService = expenseService;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    @GetMapping("/dashboard/summary")
    public DashboardSummary getDashboardSummary(@RequestParam String month) {
        YearMonth ym = YearMonth.parse(month);
        return expenseService.getSummaryForMonth(ym.getYear(), ym.getMonthValue());
    }

    @GetMapping("/expenses")
    public List<ExpenseResponse> listExpenses(@RequestParam String month) {
        YearMonth ym = YearMonth.parse(month);
        return expenseService.getExpensesForMonth(ym.getYear(), ym.getMonthValue()).stream()
            .map(ExpenseResponse::from)
            .toList();
    }

    @PostMapping("/expenses")
    public ResponseEntity<ExpenseResponse> createExpense(@Valid @RequestBody ExpenseRequest request) {
        Expense created = expenseService.createExpense(
            request.amount(),
            request.expenseDate(),
            request.payerId(),
            request.categoryId(),
            request.description()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(ExpenseResponse.from(created));
    }

    @DeleteMapping("/expenses/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/categories")
    public List<CategoryResponse> listCategories() {
        return categoryRepository.findAll().stream().map(CategoryResponse::from).toList();
    }

    @GetMapping("/users")
    public List<UserResponse> listUsers() {
        return userRepository.findAll().stream().map(UserResponse::from).toList();
    }
}
