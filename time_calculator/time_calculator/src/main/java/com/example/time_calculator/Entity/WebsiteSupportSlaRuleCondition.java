package com.example.time_calculator.Entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;


@Entity
@Table(name = "website_support_sla_rule_condition")
@Data
public class WebsiteSupportSlaRuleCondition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "type", nullable = false)
    private String type;

    @Column(name = "create_date")
    private LocalDateTime createDate;

    @Column(name = "write_date")
    private LocalDateTime writeDate;

    /* ================= RELATION ================= */

    @ManyToOne
    @JoinColumn(name = "wssr_id")
    private WebsiteSupportSlaRule slaRule;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private WebsiteSupportTicketCategory category;

    @ManyToOne
    @JoinColumn(name = "subcategory_id")
    private WebsiteSupportTicketSubcategory subcategory;

    @ManyToOne
    @JoinColumn(name = "priority_id")
    private TicketPriority priority;

    @ManyToOne
    @JoinColumn(name = "create_uid")
    private ResUsers createUser;

    @ManyToOne
    @JoinColumn(name = "write_uid")
    private ResUsers writeUser;
}