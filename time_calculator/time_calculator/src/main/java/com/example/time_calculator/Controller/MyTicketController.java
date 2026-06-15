package com.example.time_calculator.Controller;

import com.example.time_calculator.Entity.ResUsers;
import com.example.time_calculator.Repository.ResUsersRepository;
import com.example.time_calculator.Security.SecurityRoleUtil;
import com.example.time_calculator.Service.SupportTicketService;
import com.example.time_calculator.dto.DashboardSummaryDTO;
import com.example.time_calculator.dto.MyTicketListDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/my")
@RequiredArgsConstructor
public class MyTicketController {

    private final SupportTicketService supportTicketService;
    private final ResUsersRepository resUsersRepository;
    private final SecurityRoleUtil roleUtil;

    @GetMapping("/tickets")
    public ResponseEntity<List<MyTicketListDTO>> getMyTickets(Authentication authentication) {
        String login = authentication.getName();

        ResUsers currentUser = resUsersRepository
                .findDetailedByLoginAndActiveTrue(login)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(supportTicketService.getMyTickets(currentUser));
    }

    @GetMapping("/dashboard-summary")
    public ResponseEntity<DashboardSummaryDTO> getDashboardSummary(Authentication authentication) {
        String login = authentication.getName();

        ResUsers currentUser = resUsersRepository
                .findDetailedByLoginAndActiveTrue(login)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean privileged = roleUtil.isPrivileged(authentication);

        return ResponseEntity.ok(
                supportTicketService.getDashboardSummary(currentUser, privileged)
        );
    }
}