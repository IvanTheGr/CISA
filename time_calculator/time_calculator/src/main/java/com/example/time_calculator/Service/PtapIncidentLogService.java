package com.example.time_calculator.Service;

import com.example.time_calculator.Entity.PtapIncidentLog;
import com.example.time_calculator.Entity.SupportTicket;
import com.example.time_calculator.Repository.PtapIncidentLogRepository;
import com.example.time_calculator.Repository.SupportTicketRepository;
import com.example.time_calculator.dto.IncidentLogSubmitDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PtapIncidentLogService {

    @Autowired
    PtapIncidentLogRepository repository;

    @Autowired
    SupportTicketRepository supportTicketRepository;

    /* ================= GET ================= */

    public PtapIncidentLog getByTicketId(Long ticketId) {
        return repository.findByTicket_Id(ticketId).orElse(null);
    }

    public PtapIncidentLog getIncidentByTicketNumber(String ticketNumber) {
        return repository
                .findByTicketNumber(ticketNumber)
                .orElse(null);
    }

    /* ================= UPDATE ================= */

    public PtapIncidentLog updateIncidentLog(Long ticketId, PtapIncidentLog dto) {
        PtapIncidentLog log = repository.findByTicket_Id(ticketId)
                .orElseThrow(() ->
                        new RuntimeException("Incident Log not found for ticket " + ticketId));

        log.setIssue(dto.getIssue());
        log.setImpact(dto.getImpact());
        log.setEnvironment(dto.getEnvironment());
        log.setChronology(dto.getChronology());
        log.setRootCause(dto.getRootCause());
        log.setWorkaround(dto.getWorkaround());
        log.setRecommendation(dto.getRecommendation());
        log.setNotes(dto.getNotes());
        log.setPermanentSolution(dto.getPermanentSolution());

        return repository.save(log);
    }

    /* ================= SUBMIT REQUIRED INCIDENT LOG ================= */

    public PtapIncidentLog submitIncidentLog(Long ticketId, IncidentLogSubmitDTO dto) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket tidak ditemukan: " + ticketId));

        PtapIncidentLog log = repository.findByTicket_Id(ticketId)
                .orElseGet(() -> {
                    PtapIncidentLog newLog = new PtapIncidentLog();
                    newLog.setTicket(ticket);
                    return newLog;
                });

        log.setIssue(dto.getIssue());
        log.setImpact(dto.getImpact());
        log.setEnvironment(dto.getEnvironment());
        log.setChronology(dto.getChronology());
        log.setWorkaround(dto.getWorkaround());
        log.setPermanentSolution(dto.getPermanentSolution());
        log.setRecommendation(dto.getRecommendation());
        log.setNotes(dto.getNotes());

        /*
         * Root Cause tidak wajib dari form baru.
         * Kalau entity/table wajib rootCause, isi default dari permanentSolution/notes.
         */
        if (log.getRootCause() == null || log.getRootCause().isBlank()) {
            log.setRootCause("-");
        }

        log.setState("SUBMITTED");

        return repository.save(log);
    }
}