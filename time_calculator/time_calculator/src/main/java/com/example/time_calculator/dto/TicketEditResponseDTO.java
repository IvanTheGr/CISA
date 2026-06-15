package com.example.time_calculator.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketEditResponseDTO {

    private Long id;
    private String ticketNumber;

    private String subject;
    private String channel;

    private String stateName;
    private String stateTicket;

    private String customerName;
    private String personName;
    private String email;

    private String partnerName;
    private String companyName;

    private String productName;
    private String priorityName;

    private String assignedPic;
    private String picName;

    private LocalDateTime createDate;
    private LocalDateTime createDateTime;

    private LocalDateTime startResolutionTime;
    private LocalDateTime endResolutionTime;

    private LocalDateTime startResolutionTimeNoGmt;
    private LocalDateTime endResolutionTimeNoGmt;

    private LocalDate closeDate;
    private LocalDateTime closeTime;

    private String responseTime;
    private String resolutionTime;
    private String responseToClose;

    private Long slaId;
    private String countdownCondition;

    /*
     * Ini supaya frontend lama tetap jalan:
     * ticket.product?.name
     * ticket.priority?.name
     * ticket.state?.name
     * ticket.partner?.parent?.name
     */
    private SimpleRefDTO product;
    private SimpleRefDTO priority;
    private SimpleRefDTO state;
    private PartnerRefDTO partner;
    private UserRefDTO user;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SimpleRefDTO {
        private Long id;
        private String name;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PartnerRefDTO {
        private Long id;
        private String name;
        private PartnerRefDTO parent;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserRefDTO {
        private Long id;
        private String name;
        private PartnerRefDTO partner;
        private EmployeeRefDTO employee;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeeRefDTO {
        private Long id;
        private String name;
    }
}