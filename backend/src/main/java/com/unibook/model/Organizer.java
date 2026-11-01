package com.unibook.model;

/**
 * Academic Requirement: Inheritance
 * Represents an academic department, professor, or student society
 * responsible for organizing campus events.
 */
public class Organizer extends CampusEntity {
    private String department;
    private String contactEmail;

    public Organizer() {
        super();
    }

    public Organizer(int id, String name, String department, String contactEmail) {
        super(id, name);
        this.department = department;
        this.contactEmail = contactEmail;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    @Override
    public String toString() {
        return "Organizer [id=" + id + ", name='" + name + "', department='" + department + "']";
    }
}
