package com.example.time_calculator.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ptap_web_support_sla")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PtapWebSupportSla {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /* FK partner */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_id")
    private ResPartner partner;

    /* FK product */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private ProductTemplate product;

    /* FK priority */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "priority_id")
    private TicketPriority priority;

    @Column(name = "response_time")
    private Double responseTime;

    @Column(name = "resolution_time")
    private Double resolutionTime;

    @Column(name = "countdown_condition")
    private String countdownCondition;

    @Column(name = "warning_resolution_time")
    private Double warningResolutionTime;

    @Column(name = "create_date")
    private LocalDateTime createDate;

    @Column(name = "write_date")
    private LocalDateTime writeDate;

    /* FK create_uid */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "create_uid")
    private ResUsers createUid;

    /* FK write_uid */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "write_uid")
    private ResUsers writeUid;
}
