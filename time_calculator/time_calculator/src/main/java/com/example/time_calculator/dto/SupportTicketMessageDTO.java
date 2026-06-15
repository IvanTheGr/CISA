package com.example.time_calculator.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupportTicketMessageDTO {

    private String content;

    private LocalDateTime createDate;

    private Double responseTime;

    private Double resolutionTime;
}
