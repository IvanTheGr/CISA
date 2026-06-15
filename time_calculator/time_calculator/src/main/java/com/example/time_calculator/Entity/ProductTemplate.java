package com.example.time_calculator.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

/**
 * Maps: public.product_template
 *
 * Relationships:
 * - ManyToMany → HrEmployee  (employee_ids via product_template_hr_employee_rel) ← NEW from JSON
 * - ManyToMany ← ResPartner  (product_ids, inverse side managed by ResPartner)    ← NEW from JSON
 */
@Entity
@Table(name = "product_template")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductTemplate {

    @Id
    @Column(name = "id")
    private Long id;

    /**
     * Product display name.
     * JSON: "name" (char, required=true, translate=true)
     */
    @Column(name = "name", nullable = false)
    private String name;

    /**
     * Internal description / notes visible only to staff.
     * JSON: "description" (text, translate=true)
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * Product type: "consu" (Consumable) or "service" (Service).
     * JSON: "type" (selection, required=true)
     */
    @Column(name = "type")
    private String type;
    @Column(name = "active")
    private Boolean active;

    /**
     * Employees linked to this product/service (e.g., support engineers).
     * JSON: employee_ids → hr.employee (Many-to-Many, store=true)
     * NEW: was missing from the original entity.
     *
     * Join table name inferred from Odoo standard:
     *   product_template_hr_employee_rel
     * ⚠️  Verify the actual join table name against your database schema.
     */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "product_template_hr_employee_rel",
            joinColumns = @JoinColumn(name = "product_template_id"),
            inverseJoinColumns = @JoinColumn(name = "hr_employee_id")
    )
    @JsonIgnore
    private List<HrEmployee> employees;

    /**
     * Partners that have subscribed to / are associated with this product.
     * JSON: product_ids on res.partner side → Many-to-Many (inverse side here).
     * This is the non-owning side; ResPartner owns the join table.
     * NEW: was missing from the original entity.
     */
    @ManyToMany(mappedBy = "products", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<ResPartner> partners;
}
