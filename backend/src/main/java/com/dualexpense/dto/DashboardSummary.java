package com.dualexpense.dto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardSummary(BigDecimal householdTotal, List<UserTotal> userTotals, List<UserTopCategory> topCategories) {
    public record UserTotal(Long userId, String userName, BigDecimal total) {
    }

    public record UserTopCategory(Long userId, String userName, String categoryName, BigDecimal total) {
    }
}
