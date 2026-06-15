package com.example.time_calculator.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketDetailDTO {
    private Long id;
    private String ticketNumber;
    private String subject;
    private String customerName;
    private String email;
    private String company;
    private String priority;
    private String product;
    private String state;
    private String channel;
    private String assignedPic;
    private Boolean hasAssignedPic;

    private String firstResponseAt;
    private String resolutionStartAt;
    private String resolutionEndAt;

    private String firstResponseTime;
    private String resolutionTime;
}