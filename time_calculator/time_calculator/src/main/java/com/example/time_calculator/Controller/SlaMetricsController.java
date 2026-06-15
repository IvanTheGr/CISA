package com.example.time_calculator.Controller;

import com.example.time_calculator.Entity.SupportTicket;
import com.example.time_calculator.Repository.SupportTicketRepository;
import com.example.time_calculator.dto.SlaMetricsDto;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/sla-metrics")
@RequiredArgsConstructor
public class SlaMetricsController {

    private final SupportTicketRepository ticketRepo;

    @GetMapping
    public List<SlaMetricsDto> getAll() {
        return ticketRepo.findAllForSlaMetrics()
                .stream()
                .map(this::toDto)
                .toList();
    }

    private SlaMetricsDto toDto(SupportTicket t) {
        SlaMetricsDto dto = new SlaMetricsDto();
        dto.setTicketId(t.getId());
        dto.setTicketNumber(t.getTicketNumber());
        dto.setSlaActive(t.getSlaActive());
        dto.setStateName(t.getStateName());

        if (t.getPartner() != null) {
            String dn = t.getPartner().getDisplayName();
            dto.setCustomerName(dn != null ? dn : t.getPartner().getName());
        }
        if (t.getProduct() != null)  dto.setProductName(t.getProduct().getName());
        if (t.getPriority() != null) dto.setPriorityName(t.getPriority().getName());

        // SLA targets written to the ticket by SlaEngineService at creation time
        dto.setSlaTargetResponse(t.getResponseTime());
        dto.setSlaTargetResolution(t.getResolutionTime());

        // Compute actual times from stored timestamps
        LocalDateTime open  = t.getCreateDateTime();
        LocalDateTime start = t.getStartResolutionTime();
        LocalDateTime end   = t.getEndResolutionTime();

        if (open != null && start != null) {
            double hrs = Duration.between(open, start).toMinutes() / 60.0;
            dto.setActualResponseTime(round2(hrs));
            dto.setFirstResponseTime(round2(hrs));
        }
        if (start != null && end != null) {
            double hrs = Duration.between(start, end).toMinutes() / 60.0;
            dto.setActualResolutionTime(round2(hrs));
        }
        if (open != null && end != null) {
            double hrs = Duration.between(open, end).toMinutes() / 60.0;
            dto.setTotalResolutionTime(round2(hrs));
        }

        // Breach flags
        if (dto.getActualResponseTime() != null && dto.getSlaTargetResponse() != null)
            dto.setResponseBreached(dto.getActualResponseTime() > dto.getSlaTargetResponse());

        if (dto.getActualResolutionTime() != null && dto.getSlaTargetResolution() != null)
            dto.setResolutionBreached(dto.getActualResolutionTime() > dto.getSlaTargetResolution());

        return dto;
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
