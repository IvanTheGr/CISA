package com.example.time_calculator.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupportTicketDTO {
    private Long id;
    private LocalDateTime createDateTime;
    private LocalDateTime startResolutionTime;
    private LocalDateTime endResolutionTime;
}
