package com.unibook.model;

/**
 * Academic Requirement: Abstract Base Class (Inheritance)
 * Serves as the fundamental root entity for all campus resources,
 * organizations, and scheduled events in UniBook.
 */
public abstract class CampusEntity {
    protected int id;
    protected String name;

    public CampusEntity() {
    }

    public CampusEntity(int id, String name) {
        this.id = id;
        this.name = name;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Override
    public String toString() {
        return getClass().getSimpleName() + " [id=" + id + ", name='" + name + "']";
    }
}
