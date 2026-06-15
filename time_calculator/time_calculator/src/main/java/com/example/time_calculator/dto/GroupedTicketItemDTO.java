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
public class GroupedTicketItemDTO {
    private Long id;
    private String createdOn;
    private String ticketNumber;
    private String assignedPic;
    private String product;
    private String priority;
    private String company;
    private String customerName;
    private String state;
    private String subject;
    private String statusTicket;
    private LocalDateTime sortCreatedOn;
}
