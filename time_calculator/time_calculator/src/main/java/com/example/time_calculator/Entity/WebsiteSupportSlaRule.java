package com.example.time_calculator.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "website_support_sla_rule", schema = "public")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WebsiteSupportSlaRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "response_time", nullable = false)
    private Double responseTime;

    @Column(name = "countdown_condition", nullable = false)
    private String countdownCondition;

    @Column(name = "create_date")
    private LocalDateTime createDate;

    @Column(name = "write_date")
    private LocalDateTime writeDate;

    /* ================= RELATION ================= */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vsa_id")
    private WebsiteSupportSla sla;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "create_uid")
    private ResUsers createUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "write_uid")
    private ResUsers writeUser;
}