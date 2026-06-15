package com.example.time_calculator.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "hr_employee")
@Data
public class HrEmployee {

    @Id
    @Column(name = "id")
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "active")
    private Boolean active;

    @Column(name = "work_email")
    private String workEmail;

    @Column(name = "mobile_phone")
    private String mobilePhone;

    @Column(name = "work_phone")
    private String workPhone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    @JsonIgnore
    private ResUsers user;
}
