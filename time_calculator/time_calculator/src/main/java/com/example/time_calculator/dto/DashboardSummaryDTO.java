package com.example.time_calculator.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryDTO {

    private Long totalOpen;
    private Long totalClosed;
    private Long totalMyOpen;
    private Long totalUnassigned;
    private Long totalMyTickets;
}