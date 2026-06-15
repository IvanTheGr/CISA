package com.example.time_calculator.Controller;

import com.example.time_calculator.Entity.ResUsers;
import com.example.time_calculator.Repository.ResUsersRepository;
import com.example.time_calculator.Security.SecurityRoleUtil;
import com.example.time_calculator.Service.SupportTicketService;
import com.example.time_calculator.dto.DashboardSummaryDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/my")
@RequiredArgsConstructor
public class DashboardMyTicket {

    private final SupportTicketService supportTicketService;
    private final ResUsersRepository resUsersRepository;
    private final SecurityRoleUtil roleUtil;

    @GetMapping("/summary")
    public DashboardSummaryDTO getSummary(Authentication authentication) {

        String login = authentication.getName();

        ResUsers currentUser = resUsersRepository
                .findByLoginAndActiveTrue(login)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean privileged = roleUtil.isPrivileged(authentication);

        return supportTicketService.getDashboardSummary(currentUser, privileged);
    }
}