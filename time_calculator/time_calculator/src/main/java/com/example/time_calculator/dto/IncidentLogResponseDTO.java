package com.example.time_calculator.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class IncidentLogResponseDTO {
    private Integer id;
    private String issue;
    private String impact;
    private String environment;
    private String chronology;
    private String rootCause;
    private String workaround;
    private String recommendation;
    private String notes;
    private String permanentSolution;
    private String state;
}
