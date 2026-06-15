package com.example.time_calculator.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketHistoryDetailDTO {

    private Long id;
    private String ticketNumber;
    private String subject;

    private String companyName;
    private String customerName;
    private String email;
    private String productName;
    private String priorityName;
    private String assignedPic;
    private String stateName;
    private String channel;

    private LocalDateTime createDateTime;
    private LocalDateTime createDate;
    private LocalDateTime closeTime;
    private LocalDate closeDate;

    private String responseTime;
    private String resolutionTime;
    private String responseToClose;

    private List<TicketMessageResponseDTO> messages;
    private IncidentLogResponseDTO incidentLog;
    private CustomerRatingDTO customerRating;
}