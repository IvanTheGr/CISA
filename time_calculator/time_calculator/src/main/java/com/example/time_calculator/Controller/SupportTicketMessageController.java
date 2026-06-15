package com.example.time_calculator.Controller;

import com.example.time_calculator.Service.SupportTicketMessageService;
import com.example.time_calculator.dto.SupportTicketMessageDTO;
import com.example.time_calculator.dto.TicketMessageResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/message")
@RequiredArgsConstructor
public class SupportTicketMessageController {

    private final SupportTicketMessageService supportTicketMessageService;

    @GetMapping
    public List<TicketMessageResponseDTO> getAll() {
        return supportTicketMessageService.getAllSupportTicketMessageResponses();
    }

    @GetMapping("/by-ticket-id")
    public List<TicketMessageResponseDTO> getByTicketId(@RequestParam Long id) {
        return supportTicketMessageService.findSupportTicketMessageResponsesByTicketId(id);
    }

    @GetMapping("/by-number")
    public List<TicketMessageResponseDTO> getByTicketNumber(@RequestParam String ticketNumber) {
        return supportTicketMessageService.findSupportTicketMessageResponsesByTicketNumber(ticketNumber);
    }

    @PutMapping("/edit")
    public ResponseEntity<TicketMessageResponseDTO> updateMessage(
            @RequestParam Long id,
            @RequestBody SupportTicketMessageDTO dto
    ) {
        return ResponseEntity.ok(
                supportTicketMessageService.updateSupportTicketMessageEditableFields(id, dto)
        );
    }

    @PostMapping(value = "/send/{ticketId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> sendMessage(
            @PathVariable Long ticketId,
            @RequestParam(value = "content", required = false) String content,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            Authentication authentication
    ) {
        try {
            return ResponseEntity.ok(
                    supportTicketMessageService.sendMessage(
                            ticketId,
                            content,
                            files,
                            authentication.getName()
                    )
            );
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(
                    "SEND MESSAGE ERROR: " + e.getMessage()
            );
        }
    }
}