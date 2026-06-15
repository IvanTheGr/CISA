package com.example.time_calculator.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ptap_incident_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PtapIncidentLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "issue", columnDefinition = "TEXT")
    private String issue;

    @Column(name = "impact", columnDefinition = "TEXT")
    private String impact;

    @Column(name = "environment", columnDefinition = "TEXT")
    private String environment;

    @Column(name = "chronology", columnDefinition = "TEXT")
    private String chronology;

    @Column(name = "root_cause", columnDefinition = "TEXT")
    private String rootCause;

    @Column(name = "workaround", columnDefinition = "TEXT")
    private String workaround;

    @Column(name = "recommendation", columnDefinition = "TEXT")
    private String recommendation;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "permanent_solution", columnDefinition = "TEXT")
    private String permanentSolution;

    @Column(name = "state")
    private String state;

    @Column(name = "create_date")
    private LocalDateTime createDate;

    @Column(name = "write_date")
    private LocalDateTime writeDate;

    /*
     * =========================
     * RELATIONS (FOREIGN KEY)
     * =========================
     */

    @ManyToOne
    @JoinColumn(name = "ticket_id")
    private SupportTicket ticket;

    @ManyToOne
    @JoinColumn(name = "ticket_company_id")
    private ResPartner ticketCompany;

    @ManyToOne
    @JoinColumn(name = "pic_user_id")
    private ResUsers picUser;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private ProductTemplate product;

    @ManyToOne
    @JoinColumn(name = "create_uid")
    private ResUsers createUser;

    @ManyToOne
    @JoinColumn(name = "write_uid")
    private ResUsers writeUser;

//    @ManyToOne
//    @JoinColumn(name = "message_main_attachment_id")
//    private IrAttachment messageMainAttachment;
}
