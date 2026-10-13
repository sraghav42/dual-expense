package com.dualexpense.dto;

import com.dualexpense.model.Category;

public record CategoryResponse(Long id, String name, String iconIdentifier) {
    public static CategoryResponse from(Category category) {
        return new CategoryResponse(category.getId(), category.getName(), category.getIconIdentifier());
    }
}
