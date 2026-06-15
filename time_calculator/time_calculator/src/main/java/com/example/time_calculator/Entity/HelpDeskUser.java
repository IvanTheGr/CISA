package com.example.time_calculator.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * HelpDeskUser — a lightweight "virtual" table view of res_users + res_partner
 * for the User Management screen.
 *
 * Since this system uses Odoo's existing schema (res_users + res_partner),
 * we manage users through those two tables. This entity class is used
 * purely for JPA mapping; actual CRUD goes through ResUsers + ResPartner.
 *
 * Database: res_users (id, login, password, active, create_date, partner_id)
 *           res_partner (id, name, email, phone)
 */
@Entity
@Table(name = "res_users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HelpDeskUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String login;            // maps to res_users.login (username)

    @Column
    private String password;

    @Column
    private Boolean active;

    @Column(name = "create_date")
    private LocalDateTime createDate;

    @Column(name = "write_date")
    private LocalDateTime writeDate;

    @Column(name = "partner_id")
    private Long partnerId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "partner_id", insertable = false, updatable = false)
    private ResPartner partner;

    /**
     * Computed: last login time comes from res_users.write_date
     * (Odoo updates write_date on login events)
     */
    public LocalDateTime getLastLogin() {
        return this.writeDate;
    }
}
