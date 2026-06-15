package com.example.time_calculator.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Maps: public.ir_attachment
 *
 */
@Entity
@Table(name = "ir_attachment", schema = "public")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class IrAttachment {

    @Id
    @Column(name = "id")
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "res_name")
    private String resName;

    @Column(name = "res_model")
    private String resModel;

    @Column(name = "res_id")
    private Long resId;

    @Column(name = "type")
    private String type;

    @Column(name = "url", columnDefinition = "text")
    private String url;

    @Column(name = "datas_fname")
    private String datasFname;

    @Column(name = "mimetype")
    private String mimetype;

    @Column(name = "file_size")
    private Integer fileSize;

    @Column(name = "checksum")
    private String checksum;

    @Column(name = "index_content", columnDefinition = "text")
    private String indexContent;

    @Column(name = "store_fname")
    private String storeFname;

    @Column(name = "public")
    private Boolean isPublic = false;

    @Column(name = "create_date")
    private LocalDateTime createDate;

    @Column(name = "write_date")
    private LocalDateTime writeDate;

    // ── FK: company_id → res_company ────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private ResCompany company;

    // ── FK: ptap_parent_id → ir_attachment (self-ref) ───────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ptap_parent_id")
    private IrAttachment ptapParent;

    // ── FK: tailored_from_id → ir_attachment (self-ref) ─────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tailored_from_id")
    private IrAttachment tailoredFrom;

    // ── FK: create_uid / write_uid → res_users ───────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "create_uid")
    private ResUsers createUid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "write_uid")
    private ResUsers writeUid;
}
