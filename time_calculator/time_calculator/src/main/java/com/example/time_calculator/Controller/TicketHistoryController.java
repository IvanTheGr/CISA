package com.example.time_calculator.Controller;

import com.example.time_calculator.Entity.PtapIncidentLog;
import com.example.time_calculator.Entity.SupportTicket;
import com.example.time_calculator.Repository.PtapIncidentLogRepository;
import com.example.time_calculator.Repository.SupportTicketRepository;
import com.example.time_calculator.Service.IncidentWordExportService;
import com.example.time_calculator.Service.TicketHistoryService;
import com.example.time_calculator.dto.TicketHistoryDetailDTO;
import com.example.time_calculator.dto.TicketHistoryResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/ticket-history")
@RequiredArgsConstructor
public class TicketHistoryController {

    private final TicketHistoryService ticketHistoryService;
    private final SupportTicketRepository supportTicketRepository;
    private final PtapIncidentLogRepository incidentLogRepository;
    private final IncidentWordExportService incidentWordExportService;

    @GetMapping("/my")
    public ResponseEntity<TicketHistoryResponseDTO> getMyHistory(Authentication authentication) {
        return ResponseEntity.ok(
                ticketHistoryService.getMyHistory(authentication.getName())
        );
    }

    @GetMapping("/detail/{ticketId}")
    public ResponseEntity<TicketHistoryDetailDTO> getDetail(
            @PathVariable Long ticketId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                ticketHistoryService.getDetail(ticketId, authentication.getName())
        );
    }

    @GetMapping("/download/{ticketId}")
    public ResponseEntity<byte[]> downloadIncidentWord(@PathVariable Long ticketId) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));

        PtapIncidentLog log = incidentLogRepository.findByTicket_Id(ticketId)
                .orElseThrow(() -> new RuntimeException("Incident log not found: " + ticketId));

        byte[] wordBytes = incidentWordExportService.generateIncidentReport(ticket, log);

        String ticketNumber = ticket.getTicketNumber() != null
                ? ticket.getTicketNumber()
                : String.valueOf(ticketId);

        String filename = "Incident-Report-" + ticketNumber + "-" + LocalDate.now() + ".docx";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                ))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"")
                .body(wordBytes);
    }
}