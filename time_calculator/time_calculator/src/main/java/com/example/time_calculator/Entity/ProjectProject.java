package com.example.time_calculator.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Maps: public.project_project
 *
 */
@Entity
@Table(name = "project_project", schema = "public")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProjectProject {

    @Id
    @Column(name = "id")
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "active")
    private Boolean active = true;

    @Column(name = "sequence")
    private Integer sequence;

    @Column(name = "privacy_visibility")
    private String privacyVisibility;

    @Column(name = "alias_name")
    private String aliasName;

    @Column(name = "create_date")
    private LocalDateTime createDate;

    @Column(name = "write_date")
    private LocalDateTime writeDate;

    // ── FK: subtask_project_id → project_project (self-ref) ─────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subtask_project_id")
    private ProjectProject subtaskProject;

    // ── FK: company_id → res_company ────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private ResCompany company;

    // ── FK: partner_id → res_partner ────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_id")
    private ResPartner partner;

    // ── FK: message_main_attachment_id → ir_attachment ──────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_main_attachment_id")
    private IrAttachment messageMainAttachment;

    // ── FK: user_id → res_users (project manager) ───────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private ResUsers projectManager;

    // ── FK: co_pm_user_id → res_users (co-project manager) ──────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "co_pm_user_id")
    private ResUsers coPmUser;

    // ── FK: sm_user_id → res_users (service manager) ────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sm_user_id")
    private ResUsers smUser;

    // ── FK: co_sm_user_id → res_users (co-service manager) ──────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "co_sm_user_id")
    private ResUsers coSmUser;

    // ── FK: create_uid / write_uid → res_users ───────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "create_uid")
    private ResUsers createUid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "write_uid")
    private ResUsers writeUid;
}
