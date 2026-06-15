package com.example.time_calculator.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Maps: public.website_support_ticket_subcategory
 *
 */
@Entity
@Table(name = "website_support_ticket_subcategory", schema = "public")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WebsiteSupportTicketSubcategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "active")
    private Boolean active = true;

    @Column(name = "create_date")
    private LocalDateTime createDate;

    @Column(name = "write_date")
    private LocalDateTime writeDate;

    // ── FK: parent_category_id → website_support_ticket_category ────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_category_id")
    private WebsiteSupportTicketCategory parentCategory;

    // ── FK: create_uid / write_uid → res_users ───────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "create_uid")
    private ResUsers createUid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "write_uid")
    private ResUsers writeUid;
}
