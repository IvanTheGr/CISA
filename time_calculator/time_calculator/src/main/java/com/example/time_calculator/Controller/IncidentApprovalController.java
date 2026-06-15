package com.example.time_calculator.Controller;

import com.example.time_calculator.Entity.PtapIncidentLog;
import com.example.time_calculator.Entity.SupportTicket;
import com.example.time_calculator.Repository.PtapIncidentLogRepository;
import com.example.time_calculator.Repository.SupportTicketRepository;
import com.example.time_calculator.Security.SecurityRoleUtil;
import com.example.time_calculator.Service.IncidentApprovalService;
import com.example.time_calculator.Service.IncidentWordExportService;
import com.example.time_calculator.dto.ManagerApprovalResponseDTO;
import com.example.time_calculator.dto.TicketHistoryDetailDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/incident-approval")
@RequiredArgsConstructor
public class IncidentApprovalController {

    private final IncidentApprovalService incidentApprovalService;
    private final SecurityRoleUtil roleUtil;
    private final SupportTicketRepository supportTicketRepository;
    private final PtapIncidentLogRepository incidentLogRepository;
    private final IncidentWordExportService incidentWordExportService;

    @GetMapping
    public ResponseEntity<ManagerApprovalResponseDTO> getApprovalList(
            Authentication authentication
    ) {
        if (!roleUtil.isManager(authentication)) {
            throw new AccessDeniedException("Only manager can access incident approval");
        }

        return ResponseEntity.ok(incidentApprovalService.getApprovalList());
    }

    @GetMapping("/detail/{ticketId}")
    public ResponseEntity<TicketHistoryDetailDTO> getApprovalDetail(
            @PathVariable Long ticketId,
            Authentication authentication
    ) {
        if (!roleUtil.isManager(authentication)) {
            throw new AccessDeniedException("Only manager can access incident approval detail");
        }

        return ResponseEntity.ok(
                incidentApprovalService.getApprovalDetail(ticketId)
        );
    }

    @PutMapping("/approve/{ticketId}")
    public ResponseEntity<?> approveIncident(
            @PathVariable Long ticketId,
            Authentication authentication
    ) {
        if (!roleUtil.isManager(authentication)) {
            throw new AccessDeniedException("Only manager can approve incident log");
        }

        return ResponseEntity.ok(
                incidentApprovalService.approveIncident(ticketId, authentication.getName())
        );
    }

    @GetMapping("/download/{ticketId}")
    public ResponseEntity<byte[]> downloadIncidentWord(
            @PathVariable Long ticketId,
            Authentication authentication
    ) {
        if (!roleUtil.isManager(authentication)) {
            throw new AccessDeniedException("Only manager can download incident log");
        }

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