package com.example.time_calculator.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Table(name = "website_support_ticket")
public class SupportTicket {
    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "message_main_attachment_id")
    private Long messageMainAttachmentId;

    @Column(name = "channel")
    private String channel;

    @Column(name = "create_user_id")
    private Long createUserId;

    @Column(name = "priority_id")
    private Long priorityId;

    @Column(name = "partner_id")
    private Long partnerId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "person_name")
    private String personName;

    @Column(name = "email")
    private String email;

    @Column(name = "support_email")
    private String supportEmail;

    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "sub_category_id")
    private Long subCategoryId;

    @Column(name = "subject")
    private String subject;

    @Column(name = "description")
    private String description;

    @Column(name = "state_id")
    private Long stateId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "state_id", insertable = false, updatable = false)
    private WebsiteSupportTicketState state;

    @Column(name = "unattended")
    private Boolean unattended;

    @Column(name = "portal_access_key")
    private String portalAccessKey;

    @Column(name = "ticket_number")
    private String ticketNumber;

    @Column(name = "company_id")
    private Long companyId;

    @Column(name = "support_rating")
    private Double supportRating;

    @Column(name = "support_comment")
    private String supportComment;

    @Column(name = "close_comment")
    private String closeComment;

    @Column(name = "close_time")
    private LocalDateTime closeTime;

    @Column(name = "close_date")
    private LocalDate  closeDate;

    @Column(name = "closed_by_id")
    private Long closedById;

    @Column(name = "time_to_close")
    private Double timeToClose;

    @Column(name = "planned_time")
    private LocalDateTime plannedTime;

    @Column(name = "approval_id")
    private Long approvalId;

    @Column(name = "approval_message")
    private String approvalMessage;

    @Column(name = "sla_id")
    private Long slaId;

    @Column(name = "sla_timer")
    private Double slaTimer;

    @Column(name = "sla_active")
    private Boolean slaActive;

    @Column(name = "sla_rule_id")
    private Long slaRuleId;

    @Column(name = "create_uid")
    private Long createUid;

    @Column(name = "create_date")
    private LocalDateTime createDate;

    @Column(name = "write_uid")
    private Long writeUid;

    @Column(name = "write_date")
    private LocalDateTime writeDate;

    @Column(name = "product_id")
    private Long productId;

    @Column(name = "parent_company_id")
    private Long parentCompanyId;

    @Column(name = "user_id_phone")
    private String userIdPhone;

    @Column(name = "user_id_email")
    private String userIdEmail;

    @Column(name = "open_comment")
    private String openComment;

    @Column(name = "state_name")
    private String stateName;

    @Column(name = "notif_l1")
    private Boolean notifL1;

    @Column(name = "notif_manager")
    private Boolean notifManager;

    @Column(name = "response_time")
    private Double responseTime;

    @Column(name = "resolution_time")
    private Double resolutionTime;

    @Column(name = "countdown_condition")
    private String countdownCondition;

    @Column(name = "state_ticket")
    private String stateTicket;

    @Column(name = "project_id")
    private Long projectId;

    @Column(name = "is_warranty")
    private Boolean isWarranty;

    @Column(name = "warning_resolution_time")
    private Double warningResolutionTime;

    @Column(name = "telegram_to_all")
    private Boolean telegramToAll;

    @Column(name = "mail_to_all")
    private Boolean mailToAll;

    @Column(name = "telegram_to_related")
    private Boolean telegramToRelated;

    @Column(name = "mail_to_related")
    private Boolean mailToRelated;

    @Column(name = "response_to_close")
    private Double responseToClose;

    @Column(name = "p1_start_date")
    private LocalDateTime p1StartDate;

    @Column(name = "escalation_level")
    private Integer escalationLevel;

    @Column(name = "l2_user_id")
    private Long l2UserId;

    @Column(name = "l3_user_id")
    private Long l3UserId;

    @Column(name = "l4_user_id")
    private Long l4UserId;

    @Column(name = "state_minim")
    private String stateMinim;

    @Column(name = "description_text")
    private String descriptionText;

    @Column(name = "create_date_time")
    private LocalDateTime createDateTime;

    @Column(name = "start_resolution_time")
    private LocalDateTime startResolutionTime;

    @Column(name = "end_resolution_time")
    private LocalDateTime endResolutionTime;

    @Column(name = "ticket_category")
    private String ticketCategory;

    @Column(name = "start_resolution_time_no_gmt")
    private LocalDateTime startResolutionTimeNoGmt;

    @Column(name = "end_resolution_time_no_gmt")
    private LocalDateTime endResolutionTimeNoGmt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_id", insertable = false, updatable = false)
    private ResPartner partner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private ProductTemplate product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    @JsonIgnore
    private ResUsers user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "priority_id", insertable = false, updatable = false)
    private TicketPriority priority;


    @JsonProperty("picName")
    public String getPicName() {

        if (user == null) return null;
        if (user.getEmployees() == null) return null;

        return user.getEmployees()
                .stream()
                .filter(emp -> Boolean.TRUE.equals(emp.getActive()))
                .map(HrEmployee::getName)
                .findFirst()
                .orElse(null);
    }


}
