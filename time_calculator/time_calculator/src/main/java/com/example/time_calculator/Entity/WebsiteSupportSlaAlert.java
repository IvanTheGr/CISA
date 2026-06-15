package com.example.time_calculator.Entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "website_support_sla_alert")
@Data
public class WebsiteSupportSlaAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vsa_id")
    private Long vsaId;

    @Column(name = "alert_time")
    private Double alertTime;

    @Column(name = "type")
    private String type;

    @Column(name = "create_uid")
    private Long createUid;

    @Column(name = "create_date")
    private LocalDateTime createDate;

    @Column(name = "write_uid")
    private Long writeUid;

    @Column(name = "write_date")
    private LocalDateTime writeDate;

}
