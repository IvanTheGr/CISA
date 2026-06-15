package com.example.time_calculator.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketMessageResponseDTO {
    private Long id;
    private String by;
    private String content;
    private LocalDateTime createDate;
    private Double responseTime;
    private Double resolutionTime;
    private MessageStateDTO state;
    private List<MessageAttachmentDTO> attachments;
}
