package com.example.time_calculator.Controller;

import com.example.time_calculator.Repository.ResUsersRepository;
import com.example.time_calculator.Security.SecurityRoleUtil;
import com.example.time_calculator.Service.MetabaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/metabase")
@RequiredArgsConstructor
public class MetabaseController {

    private final MetabaseService metabaseService;
    private final ResUsersRepository repository;
    private final SecurityRoleUtil roleUtil;

    @GetMapping("/dashboard")
    public String getDashboard(
            Authentication authentication,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String partnerName
    ) {
        boolean manager = roleUtil.isManager(authentication);
        boolean staff = roleUtil.isStaff(authentication);
        boolean customer = roleUtil.isCustomer(authentication);

        /*
         * CUSTOMER:
         * - Dashboard hanya milik dia
         * - Tidak boleh pakai filter company/date dari frontend
         */
        if (customer) {
            partnerName = repository.findPartnerNameByLogin(authentication.getName());
            startDate = null;
            endDate = null;
        }

        /*
         * STAFF:
         * - Boleh filter dashboard
         * - Jika partnerName kosong, tampil semua sesuai dashboard
         */
        if (staff) {
            // no forced partnerName
        }

        /*
         * MANAGER:
         * - Full access
         */
        if (manager) {
            // no forced partnerName
        }

        return metabaseService.generateDashboardEmbedUrl(
                authentication,
                partnerName,
                startDate,
                endDate
        );
    }

    @GetMapping("/user-role")
    public Map<String, Object> getUserRole(Authentication authentication) {
        String roleType = roleUtil.getRoleType(authentication);

        return Map.of(
                "roleType", roleType,
                "manager", roleUtil.isManager(authentication),
                "staff", roleUtil.isStaff(authentication),
                "customer", roleUtil.isCustomer(authentication),
                "privileged", roleUtil.isPrivileged(authentication)
        );
    }
}