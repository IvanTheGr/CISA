package com.example.time_calculator.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Maps: public.res_company
 *
 */
@Entity
@Table(name = "res_company", schema = "public")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ResCompany {

    @Id
    @Column(name = "id")
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "email")
    private String email;

    @Column(name = "phone")
    private String phone;

    @Column(name = "website")
    private String website;

    @Column(name = "active")
    private Boolean active = true;

    @Column(name = "sequence")
    private Integer sequence;

    @Column(name = "create_date")
    private LocalDateTime createDate;

    @Column(name = "write_date")
    private LocalDateTime writeDate;

    // ── FK: parent_id → res_company (self-ref hierarchy) ────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private ResCompany parent;

    @OneToMany(mappedBy = "parent", fetch = FetchType.LAZY)
    private List<ResCompany> children;

    // ── FK: partner_id → res_partner ────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_id")
    private ResPartner partner;

    // ── FK: create_uid / write_uid → res_users ───────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "create_uid")
    private ResUsers createUid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "write_uid")
    private ResUsers writeUid;

    // ── FK: leave_timesheet_project_id → project_project ────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leave_timesheet_project_id")
    private ProjectProject leaveTimesheetProject;
}
