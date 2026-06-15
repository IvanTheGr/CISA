package com.example.time_calculator.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManagerApprovalDTO {

    private Long id;
    private String ticketNumber;
    private String subject;

    private String companyName;
    private String customerName;
    private String productName;
    private String priorityName;
    private String assignedPic;

    private String incidentState;

    private LocalDateTime closeTime;

    private Integer customerRating;
    private String customerRatingText;
}