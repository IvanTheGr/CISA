package com.example.time_calculator.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "website_support_ticket_state")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WebsiteSupportTicketState {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "mail_template_id")
    private Long mailTemplateId;

    @Column(name = "unattended")
    private Boolean unattended;

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
