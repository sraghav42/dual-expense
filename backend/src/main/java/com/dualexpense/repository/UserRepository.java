package com.dualexpense.repository;

import java.util.Optional;

import com.dualexpense.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByName(String name);
}
