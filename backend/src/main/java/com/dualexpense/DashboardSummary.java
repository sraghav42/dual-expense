package com.dualexpense;

import java.math.BigDecimal;
import java.util.List;

public record DashboardSummary(BigDecimal householdTotal, List<UserTotal> userTotals, List<UserTopCategory> topCategories) {
}

record UserTotal(Long userId, String userName, BigDecimal total) {
}

record UserTopCategory(Long userId, String userName, String categoryName, BigDecimal total) {
}
