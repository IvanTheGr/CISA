package com.example.time_calculator.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketHistoryResponseDTO {

    private List<TicketHistoryItemDTO> pendingApproval;
    private List<TicketHistoryItemDTO> approved;
}