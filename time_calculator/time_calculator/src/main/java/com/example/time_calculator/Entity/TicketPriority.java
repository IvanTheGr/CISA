package com.example.time_calculator.Entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "website_support_ticket_priority")
@Data
public class TicketPriority {

    @Id
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "sequence")
    private Integer sequence;

//    @Column(name = "active")
//    private Boolean active = true;

    @Column(name = "create_date")
    private LocalDateTime createDate;

    @Column(name = "write_date")
    private LocalDateTime writeDate;

    // ── FK: create_uid / write_uid → res_users ───────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "create_uid")
    private ResUsers createUid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "write_uid")
    private ResUsers writeUid;
}