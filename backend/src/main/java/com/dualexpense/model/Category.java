package com.dualexpense.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "categories")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "icon_identifier", nullable = false, length = 50)
    private String iconIdentifier;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    protected Category() {
    }

    public Category(String name, String iconIdentifier, Integer displayOrder) {
        this.name = name;
        this.iconIdentifier = iconIdentifier;
        this.displayOrder = displayOrder;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getIconIdentifier() {
        return iconIdentifier;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }
}
