package com.example.time_calculator.Controller;

import com.example.time_calculator.Entity.ResUsers;
import com.example.time_calculator.Repository.ResUsersRepository;
import com.example.time_calculator.Security.SecurityRoleUtil;
import com.example.time_calculator.Service.SupportTicketService;
import com.example.time_calculator.dto.GroupedTicketCompanyDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ticket")
@RequiredArgsConstructor
public class TicketGroupedController {

    private final SupportTicketService supportTicketService;
    private final SecurityRoleUtil roleUtil;
    private final ResUsersRepository resUsersRepository;

    @GetMapping("/grouped-open")
    public List<GroupedTicketCompanyDTO> getGroupedOpenTickets(Authentication authentication) {

        if (roleUtil.isCustomer(authentication)) {
            throw new AccessDeniedException("Customer cannot access grouped ticket view");
        }

        String login = authentication.getName();

        ResUsers currentUser = resUsersRepository
                .findByLoginAndActiveTrue(login)
                .orElseThrow(() -> new RuntimeException("User not found"));

        /*
         * MANAGER:
         * - Lihat semua ticket open
         */
        if (roleUtil.isManager(authentication)) {
            return supportTicketService.getGroupedOpenTicketsForManager();
        }

        /*
         * STAFF:
         * - Hanya lihat ticket open yang assigned ke dia
         */
        return supportTicketService.getGroupedOpenTicketsForStaff(currentUser);
    }
}