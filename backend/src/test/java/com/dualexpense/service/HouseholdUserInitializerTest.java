package com.dualexpense.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.stream.StreamSupport;

import com.dualexpense.model.User;
import com.dualexpense.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.ApplicationArguments;

@ExtendWith(MockitoExtension.class)
class HouseholdUserInitializerTest {

    @Test
    void seedsConfiguredUsersWhenUserTableIsEmpty() throws Exception {
        UserRepository userRepository = mock(UserRepository.class);
        when(userRepository.count()).thenReturn(0L);
        HouseholdUserInitializer initializer = new HouseholdUserInitializer(userRepository, "Alex", "Sam");

        initializer.run(mock(ApplicationArguments.class));

        verify(userRepository).saveAll(argThat(users -> {
            List<User> seededUsers = StreamSupport.stream(users.spliterator(), false).toList();
            return seededUsers.size() == 2
                && seededUsers.get(0).getName().equals("Alex")
                && seededUsers.get(0).getPayerAccent().equals("#6366F1")
                && seededUsers.get(1).getName().equals("Sam")
                && seededUsers.get(1).getPayerAccent().equals("#14B8A6");
        }));
    }

    @Test
    void doesNotRenameOrReseedExistingUsers() throws Exception {
        UserRepository userRepository = mock(UserRepository.class);
        when(userRepository.count()).thenReturn(2L);
        HouseholdUserInitializer initializer = new HouseholdUserInitializer(userRepository, "Alex", "Sam");

        initializer.run(mock(ApplicationArguments.class));

        verify(userRepository, never()).saveAll(any());
    }

    @Test
    void rejectsBlankConfiguredNames() {
        UserRepository userRepository = mock(UserRepository.class);
        HouseholdUserInitializer initializer = new HouseholdUserInitializer(userRepository, "Alex", "  ");

        assertThatThrownBy(() -> initializer.run(mock(ApplicationArguments.class)))
            .isInstanceOf(IllegalStateException.class)
            .hasMessage("USER_1_NAME and USER_2_NAME must both be nonblank");
        verify(userRepository, never()).count();
    }
}
