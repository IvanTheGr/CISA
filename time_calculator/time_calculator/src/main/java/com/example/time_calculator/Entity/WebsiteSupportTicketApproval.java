package com.example.time_calculator.Entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import jakarta.persistence.*;

@Entity
@Table(name = "website_support_ticket_approval")
@Data
public class WebsiteSupportTicketApproval {

    @Id
    private Long id;

    private String name;

}
