package com.example.time_calculator.Controller;

import com.example.time_calculator.Entity.PtapIncidentLog;
import com.example.time_calculator.Entity.SupportTicket;
import com.example.time_calculator.Repository.SupportTicketRepository;
import com.example.time_calculator.Service.IncidentWordExportService;
import com.example.time_calculator.Service.PtapIncidentLogService;
import com.example.time_calculator.dto.IncidentLogResponseDTO;
import com.example.time_calculator.dto.IncidentLogSubmitDTO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/incident")
public class PtapIncidentLogController {

    @Autowired
    PtapIncidentLogService service;

    @Autowired
    SupportTicketRepository supportTicketRepository;

    @Autowired
    IncidentWordExportService wordExportService;

    /* ================= GET ================= */

    @GetMapping
    public ResponseEntity<IncidentLogResponseDTO> getIncidentLog(@RequestParam Long ticketId) {
        PtapIncidentLog log = service.getByTicketId(ticketId);

        if (log == null) {
            return ResponseEntity.notFound().build();
        }

        IncidentLogResponseDTO dto = IncidentLogResponseDTO.builder()
                .id(log.getId())
                .issue(log.getIssue())
                .impact(log.getImpact())
                .environment(log.getEnvironment())
                .chronology(log.getChronology())
                .rootCause(log.getRootCause())
                .workaround(log.getWorkaround())
                .recommendation(log.getRecommendation())
                .notes(log.getNotes())
                .permanentSolution(log.getPermanentSolution())
                .state(log.getState())
                .build();

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/by-number")
    public PtapIncidentLog getIncidentLogByTicketNumber(@RequestParam String ticketNumber) {
        return service.getIncidentByTicketNumber(ticketNumber);
    }

    /* ================= UPDATE ================= */

    @PutMapping("/edit")
    public PtapIncidentLog updateIncidentLog(
            @RequestParam Long ticketId,
            @RequestBody PtapIncidentLog dto
    ) {
        return service.updateIncidentLog(ticketId, dto);
    }

    /* ================= SUBMIT + DOWNLOAD WORD ================= */

    @PostMapping("/submit/{ticketId}")
    public ResponseEntity<byte[]> submitIncidentLogAndDownloadWord(
            @PathVariable Long ticketId,
            @Valid @RequestBody IncidentLogSubmitDTO dto
    ) {
        PtapIncidentLog log = service.submitIncidentLog(ticketId, dto);

        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket tidak ditemukan: " + ticketId));

        byte[] wordBytes = wordExportService.generateIncidentReport(ticket, log);

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