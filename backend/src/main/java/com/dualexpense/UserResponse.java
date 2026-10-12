package com.dualexpense;

public record UserResponse(Long id, String name, String payerAccent) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getPayerAccent());
    }
}
