package com.example.time_calculator.Controller;

import com.example.time_calculator.Entity.ResUsers;
import com.example.time_calculator.Entity.SupportTicket;
import com.example.time_calculator.Repository.ResUsersRepository;
import com.example.time_calculator.Security.SecurityRoleUtil;
import com.example.time_calculator.Service.SupportTicketService;
import com.example.time_calculator.dto.AssignPicRequestDTO;
import com.example.time_calculator.dto.CloseTicketDTO;
import com.example.time_calculator.dto.CreateTicketDTO;
import com.example.time_calculator.dto.SupportTicketDTO;
import com.example.time_calculator.dto.TicketDetailDTO;
import com.example.time_calculator.dto.TicketEditResponseDTO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/ticket")
public class SupportTicketController {

    @Autowired
    private SupportTicketService service;

    @Autowired
    private ResUsersRepository resUsersRepository;

    @Autowired
    private SecurityRoleUtil roleUtil;

    /* ================= GET ALL FOR EDIT / DELETE PAGE ================= */

    @GetMapping("/all")
    public ResponseEntity<Page<TicketEditResponseDTO>> getAllSupportTicket(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(service.getAllTicketEditDTO(page, size));
    }

    /* ================= GET BY ID OR TICKET NUMBER ================= */

    @GetMapping
    public ResponseEntity<?> getSupportTicket(@RequestParam Long id) {

        TicketEditResponseDTO ticket = service.getTicketEditByIdOrNumber(id);

        if (ticket == null) {
            return ResponseEntity
                    .status(404)
                    .body("Ticket tidak ditemukan : " + id);
        }

        return ResponseEntity.ok(ticket);
    }

    /* ================= GET BY TICKET NUMBER ================= */

    @GetMapping("/number")
    public ResponseEntity<?> getSupportTicketByNumber(
            @RequestParam String ticketNumber
    ) {
        TicketEditResponseDTO ticket = service.getTicketEditByNumber(ticketNumber);

        if (ticket == null) {
            return ResponseEntity
                    .status(404)
                    .body("Ticket tidak ditemukan : " + ticketNumber);
        }

        return ResponseEntity.ok(ticket);
    }

    /* ================= UPDATE ================= */

    @PutMapping("/edit")
    public ResponseEntity<?> updateSupportTicketStatus(
            @RequestParam Long id,
            @RequestBody SupportTicketDTO supportTicket
    ) {
        return ResponseEntity.ok(
                service.updateTicketTimestampsOnly(id, supportTicket)
        );
    }

    /* ================= CREATE ================= */

    @PostMapping("/create")
    public ResponseEntity<?> createTicket(
            @Valid @RequestBody CreateTicketDTO dto,
            Authentication authentication
    ) {
        String login = authentication.getName();

        ResUsers currentUser = resUsersRepository
                .findByLoginAndActiveTrue(login)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean privileged = roleUtil.isPrivileged(authentication);

        if (!privileged) {
            dto.setPartnerId(currentUser.getPartner().getId());
            dto.setChannel("customer");
        } else {
            dto.setChannel("staff");
        }

        SupportTicket ticket = service.createTicket(dto, currentUser);

        return ResponseEntity.ok(ticket);
    }

    /* ================= DELETE ================= */

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTicket(@PathVariable Long id) {

        SupportTicket ticket = service.getSupportTicketByIdSafe(id);

        if (ticket == null) {
            return ResponseEntity
                    .status(404)
                    .body("Ticket tidak ditemukan: " + id);
        }

        service.hardDeleteTicket(id);

        return ResponseEntity.ok("Ticket berhasil dihapus");
    }

    @DeleteMapping("/number/{ticketNumber}")
    public ResponseEntity<?> deleteTicketByNumber(@PathVariable String ticketNumber) {

        TicketEditResponseDTO ticket = service.getTicketEditByNumber(ticketNumber);

        if (ticket == null) {
            return ResponseEntity
                    .status(404)
                    .body("Ticket tidak ditemukan: " + ticketNumber);
        }

        service.hardDeleteTicket(ticket.getId());

        return ResponseEntity.ok("Ticket berhasil dihapus");
    }

    /* ================= NEXT NUMBER ================= */

    @GetMapping("/next-number")
    public String getNextTicketNumber() {
        return service.peekNextTicketNumber();
    }

    /* ================= GROUPED DETAIL ================= */

    @GetMapping("/detail/{id}")
    public ResponseEntity<TicketDetailDTO> getTicketDetail(@PathVariable Long id) {
        return ResponseEntity.ok(service.getTicketDetail(id));
    }

    /* ================= TAKE TICKET ================= */

    @PutMapping("/take/{id}")
    public ResponseEntity<?> takeTicket(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String login = authentication.getName();

        ResUsers currentUser = resUsersRepository
                .findByLoginAndActiveTrue(login)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(service.takeTicket(id, currentUser));
    }

    /* ================= ASSIGN PIC ================= */

    @PutMapping("/assign-pic/{id}")
    public ResponseEntity<?> assignPic(
            @PathVariable Long id,
            @RequestBody AssignPicRequestDTO req
    ) {
        return ResponseEntity.ok(service.assignPic(id, req.getUserId()));
    }

    /* ================= CLOSE TICKET ================= */

    @PutMapping("/close/{id}")
    public ResponseEntity<?> closeTicket(
            @PathVariable Long id,
            @RequestBody(required = false) CloseTicketDTO dto,
            Authentication authentication
    ) {
        String login = authentication.getName();

        ResUsers currentUser = resUsersRepository
                .findByLoginAndActiveTrue(login)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(service.closeTicket(id, currentUser, dto));
    }

    @GetMapping("/search-dropdown")
    public ResponseEntity<List<TicketEditResponseDTO>> searchTicketDropdown(
            @RequestParam(required = false, defaultValue = "") String keyword
    ) {
        return ResponseEntity.ok(service.searchTicketDropdown(keyword));
    }
}