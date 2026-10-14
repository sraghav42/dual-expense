package com.dualexpense.service;

import java.util.List;

import com.dualexpense.model.User;
import com.dualexpense.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class HouseholdUserInitializer implements ApplicationRunner {
    private final UserRepository userRepository;
    private final String userOneName;
    private final String userTwoName;

    public HouseholdUserInitializer(
        UserRepository userRepository,
        @Value("${USER_1_NAME}") String userOneName,
        @Value("${USER_2_NAME}") String userTwoName
    ) {
        this.userRepository = userRepository;
        this.userOneName = userOneName;
        this.userTwoName = userTwoName;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (userOneName.isBlank() || userTwoName.isBlank()) {
            throw new IllegalStateException("USER_1_NAME and USER_2_NAME must both be nonblank");
        }

        if (userRepository.count() == 0) {
            userRepository.saveAll(List.of(
                new User(userOneName, "#6366F1"),
                new User(userTwoName, "#14B8A6")
            ));
        }
    }
}
