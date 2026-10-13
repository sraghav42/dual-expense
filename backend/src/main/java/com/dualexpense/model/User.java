package com.dualexpense.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "payer_accent", nullable = false)
    private String payerAccent;

    protected User() {
    }

    public User(String name, String payerAccent) {
        this.name = name;
        this.payerAccent = payerAccent;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getPayerAccent() {
        return payerAccent;
    }
}
