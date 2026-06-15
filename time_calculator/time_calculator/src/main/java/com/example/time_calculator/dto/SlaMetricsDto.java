package com.example.time_calculator.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class SlaMetricsDto {
    private Long    ticketId;
    private String  ticketNumber;
    private String  customerName;
    private String  productName;
    private String  priorityName;
    private String  stateName;
    private Boolean slaActive;

    // Computed from ticket timestamps
    private Double actualResponseTime;   // createDateTime → startResolutionTime (h)
    private Double actualResolutionTime; // startResolutionTime → endResolutionTime (h)
    private Double firstResponseTime;    // alias of actualResponseTime
    private Double totalResolutionTime;  // createDateTime → endResolutionTime (h)

    // From SLA config attached at ticket creation by SlaEngineService
    private Double slaTargetResponse;
    private Double slaTargetResolution;

    // Breach flags (actual > target)
    private Boolean responseBreached;
    private Boolean resolutionBreached;
}
