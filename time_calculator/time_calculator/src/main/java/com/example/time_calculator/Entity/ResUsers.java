package com.example.time_calculator.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "res_users")
@Getter
@Setter
@ToString(exclude = {"employees", "partner"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ResUsers {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column
    private Boolean active;

    @Column(nullable = false)
    private String login;

    @Column
    private String password;

    @Column(name = "company_id")
    private Long companyId;

    @Column(name = "create_date")
    private LocalDateTime createDate;

    @Column(columnDefinition = "TEXT")
    private String signature;

    @Column(name = "action_id")
    private Long actionId;

    @Column
    private Boolean share;

    @Column(name = "create_uid")
    private Long createUid;

    @Column(name = "write_uid")
    private Long writeUid;

    @Column(name = "write_date")
    private LocalDateTime writeDate;

    @Column(name = "alias_id")
    private Long aliasId;

    @Column(name = "notification_type")
    private String notificationType;

    @Column(name = "odoobot_state")
    private String odoobotState;

    @Column(name = "chatter_position")
    private String chatterPosition;

    @Column(name = "website_id")
    private Long websiteId;

    @Column(name = "sale_team_id")
    private Long saleTeamId;

    @Column(name = "employee_id")
    private Long employeeId;

    @Column(name = "project_id")
    private Long projectId;

    @Column(name = "odoo8_partner_id")
    private Long odoo8PartnerId;

    @Column(name = "odoo8_login")
    private String odoo8Login;

    @Column(name = "odoo8_user_id")
    private Long odoo8UserId;

    @Column(name = "password_write_date")
    private LocalDateTime passwordWriteDate;

    @Column
    private String channel;

    @Column(name = "changed_rpc")
    private Boolean changedRpc;

    @Column(name = "created_rpc")
    private Boolean createdRpc;

//    @Column(name = "x_user_id")
//    private Long xUserId;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<HrEmployee> employees;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_id", nullable = false)
    private ResPartner partner;
}