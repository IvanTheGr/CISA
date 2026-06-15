package com.example.time_calculator.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MyTicketListDTO {
    private Long id;
    private String caseNumber;
    private String subject;
    private String priority;
    private String account;
    private String customerName;
    private LocalDateTime createdOn;
    private LocalDateTime lastUpdatedOn;
    private String state;
}