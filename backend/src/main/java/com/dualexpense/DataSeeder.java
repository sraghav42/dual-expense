package com.dualexpense;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public DataSeeder(UserRepository userRepository, CategoryRepository categoryRepository) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            userRepository.saveAll(List.of(
                new User("User 1", "#6366F1"),
                new User("User 2", "#14B8A6")
            ));
        }

        if (categoryRepository.count() == 0) {
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
    }
}
