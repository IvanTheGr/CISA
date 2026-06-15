package com.example.time_calculator.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class IncidentLogSubmitDTO {

    @NotBlank(message = "Issue wajib diisi")
    private String issue;

    @NotBlank(message = "Impact wajib diisi")
    private String impact;

    @NotBlank(message = "Environment wajib diisi")
    private String environment;

    @NotBlank(message = "Chronology wajib diisi")
    private String chronology;

    @NotBlank(message = "Workaround wajib diisi")
    private String workaround;

    @NotBlank(message = "Permanent Solution wajib diisi")
    private String permanentSolution;

    @NotBlank(message = "Recommendation wajib diisi")
    private String recommendation;

    @NotBlank(message = "Notes wajib diisi")
    private String notes;
}