package com.example.time_calculator.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SlaConfigDto {
    private Long   id;
    private Long   partnerId;
    private String partnerName;
    private Long   productId;
    private String productName;
    private Long   priorityId;
    private String priorityName;
    private Double responseTime;
    private Double resolutionTime;
    private String countdownCondition;
    private Double warningResolutionTime;
}
