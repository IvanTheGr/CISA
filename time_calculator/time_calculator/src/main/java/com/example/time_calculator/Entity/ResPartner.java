package com.example.time_calculator.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Maps: public.res_partner
 *
 * Relationships:
 * - ManyToOne  → ResPartner        (parent_id, self-referencing hierarchy)
 * - ManyToOne  → ResPartner        (commercial_partner_id)
 * - ManyToOne  → ResCompany        (company_id)
 * - ManyToOne  → ResUsers          (user_id / salesperson)
 * - ManyToOne  → ResUsers          (dedicated_support_user_id)
 * - ManyToOne  → IrAttachment      (message_main_attachment_id)
 * - ManyToOne  → PtapWebSupportSla (sla_id)   ← NEW from JSON
 * - ManyToMany → ProductTemplate   (product_ids via res_partner_product_rel) ← NEW from JSON
 * - OneToMany  → ResPartner        (children, inverse of parent_id)
 * - OneToMany  → SupportTicket     (support_ticket_ids)  ← NEW from JSON
 */
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "res_partner", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResPartner {

    @Id
    @Column(name = "id")
    private Long id;

    // ── Basic identity fields ────────────────────────────────────────────────
    @Column(name = "name")
    private String name;

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "email")
    private String email;

    @Column(name = "phone")
    private String phone;

    @Column(name = "mobile")
    private String mobile;

    // ── Address fields ───────────────────────────────────────────────────────
    @Column(name = "street")
    private String street;

    @Column(name = "street2")
    private String street2;

    @Column(name = "city")
    private String city;

    @Column(name = "zip")
    private String zip;

    // ── Web / contact fields ─────────────────────────────────────────────────
    @Column(name = "website")
    private String website;

    @Column(name = "vat")
    private String vat;

    // ── Boolean flags ────────────────────────────────────────────────────────
    @Column(name = "is_company")
    private Boolean isCompany = false;

    @Column(name = "active")
    private Boolean active = true;

    @Column(name = "customer")
    private Boolean customer = false;

    @Column(name = "supplier")
    private Boolean supplier = false;

    @Column(name = "employee")
    private Boolean employee = false;

    /**
     * Marks this partner as an admin client.
     * Sourced from JSON field: "admin_client" (boolean, store=true).
     * Used in the product tree view to show/hide SLA and Escalation buttons.
     */
    @Column(name = "admin_client")
    private Boolean adminClient = false;

    // ── Classification ───────────────────────────────────────────────────────
    @Column(name = "type")
    private String type;

    @Column(name = "lang")
    private String lang;

    @Column(name = "tz")
    private String tz;

    // ── Custom / extended fields ─────────────────────────────────────────────
    @Column(name = "short_name")
    private String shortName;

    /**
     * Prefix used when auto-generating usernames for contacts of this partner.
     * Sourced from JSON field: "username_prefix".
     */
    @Column(name = "username_prefix")
    private String usernamePrefix;

    /**
     * SMTP server address associated with this partner.
     * Sourced from JSON field: "mail_server_address".
     */
    @Column(name = "mail_server_address")
    private String mailServerAddress;

    /**
     * Legacy Odoo 8 partner ID used for data migration traceability.
     * Sourced from JSON field: "odoo8_id".
     */
    @Column(name = "odoo8_id")
    private String odoo8Id;

    /**
     * Tracks whether this partner record was last modified via RPC.
     * Sourced from JSON field: "changed_rpc".
     */
    @Column(name = "changed_rpc")
    private Boolean changedRpc;

    // ── Audit fields ─────────────────────────────────────────────────────────
    @Column(name = "create_date")
    private LocalDateTime createDate;

    @Column(name = "write_date")
    private LocalDateTime writeDate;

    // ── Relationships ─────────────────────────────────────────────────────────

    /**
     * Self-referencing parent (company hierarchy).
     * JSON: parent_id → res.partner (Many-to-One)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    @JsonIgnore
    private ResPartner parent;

    /**
     * Child contacts / sub-companies.
     * JSON: child_ids → res.partner (One-to-Many, inverse of parent_id)
     */
    @OneToMany(mappedBy = "parent", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<ResPartner> children;

    /**
     * The top-level commercial entity for this partner.
     * JSON: commercial_partner_id → res.partner (Many-to-One, readonly)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "commercial_partner_id")
    @JsonIgnore
    private ResPartner commercialPartner;

    /**
     * The company this contact belongs to.
     * JSON: company_id → res.company (Many-to-One)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    @JsonIgnore
    private ResCompany company;

    /**
     * Internal salesperson responsible for this partner.
     * JSON: user_id → res.users (Many-to-One)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private ResUsers salesperson;

    /**
     * Dedicated support user assigned to this partner.
     * JSON: dedicated_support_user_id → res.users (Many-to-One)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dedicated_support_user_id")
    @JsonIgnore
    private ResUsers dedicatedSupportUser;

    /**
     * Main message/email attachment for this partner record.
     * JSON: message_main_attachment_id → ir.attachment (Many-to-One)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_main_attachment_id")
    @JsonIgnore
    private IrAttachment messageMainAttachment;

    /**
     * SLA policy applied to this partner.
     * JSON: sla_id → website.support.sla (Many-to-One, store=true)
     * NEW: was missing from the original entity.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sla_id")
    @JsonIgnore
    private PtapWebSupportSla sla;

    /**
     * Audit: record creator.
     * JSON: create_uid → res.users (Many-to-One)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "create_uid")
    @JsonIgnore
    private ResUsers createUid;

    /**
     * Audit: last record updater.
     * JSON: write_uid → res.users (Many-to-One)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "write_uid")
    @JsonIgnore
    private ResUsers writeUid;

    /**
     * Products subscribed / associated with this partner.
     * JSON: product_ids → product.template (Many-to-Many, store=true)
     * NEW: was missing from the original entity.
     *
     * Join table name inferred from Odoo's standard naming convention:
     *   res_partner_product_template_rel
     * ⚠️  Verify the actual join table name against your database schema.
     *     Common alternatives: product_template_res_partner_rel
     */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "res_partner_product_template_rel",
            joinColumns = @JoinColumn(name = "res_partner_id"),
            inverseJoinColumns = @JoinColumn(name = "product_template_id")
    )
    @JsonIgnore
    private List<ProductTemplate> products;

    /**
     * Support tickets raised by or linked to this partner.
     * JSON: support_ticket_ids → website.support.ticket (One-to-Many, inverse of partner_id)
     * NEW: was missing from the original entity.
     */
    @OneToMany(mappedBy = "partner", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<SupportTicket> supportTickets;
}
