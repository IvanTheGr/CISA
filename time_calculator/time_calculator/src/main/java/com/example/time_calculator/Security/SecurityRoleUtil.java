package com.example.time_calculator.Security;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class SecurityRoleUtil {

    /*
     * MANAGER:
     * - Bisa buka semua page
     * - Bisa lihat semua grouped ticket
     * - Bisa approve incident log
     * Contoh user: Administrator
     */
    private static final Set<String> MANAGER_ROLES = Set.of(
            "support manager",
            "ptap manager support",
            "manager support",
            "role_support_manager",
            "role_manager"
    );

    /*
     * STAFF:
     * - Bisa buka Filter Dashboard
     * - Bisa buka semua Services
     * - Bisa buka semua Setting
     * - Bisa Create Ticket
     * - Bisa Grouped Ticket, tapi hanya ticket open milik dia
     * Contoh user: Nico Setiawan
     */
    private static final Set<String> STAFF_ROLES = Set.of(
            "support staff",
            "ptap eksternal/internal support staff",
            "external support",
            "internal support",
            "support agent",
            "role_support_staff",
            "role_staff",
            "role_support_agent"
    );

    private String normalizeRole(String role) {
        if (role == null) return "";

        return role
                .trim()
                .replace("ROLE_", "role_")
                .replace("-", " ")
                .replace("_", " ")
                .replaceAll("\\s+", " ")
                .toLowerCase();
    }

    private String normalizeRoleKey(String role) {
        if (role == null) return "";

        return role
                .trim()
                .replace("-", " ")
                .replace("_", " ")
                .replaceAll("\\s+", " ")
                .toLowerCase();
    }

    public boolean hasAnyRole(Authentication auth, Set<String> roles) {
        if (auth == null || auth.getAuthorities() == null) return false;

        return auth.getAuthorities()
                .stream()
                .anyMatch(a -> {
                    String authority = a.getAuthority();

                    String normalizedAuthority = normalizeRole(authority);
                    String normalizedKey = normalizeRoleKey(authority);

                    return roles.contains(normalizedAuthority)
                            || roles.contains(normalizedKey)
                            || roles.stream().anyMatch(role ->
                            normalizeRole(role).equals(normalizedAuthority)
                                    || normalizeRoleKey(role).equals(normalizedKey)
                    );
                });
    }

    public boolean isManager(Authentication auth) {
        return hasAnyRole(auth, MANAGER_ROLES);
    }

    public boolean isStaff(Authentication auth) {
        return hasAnyRole(auth, STAFF_ROLES);
    }

    /*
     * Dipertahankan supaya code lama yang pakai isPrivileged()
     * tetap jalan.
     *
     * Privileged = Manager atau Staff.
     */
    public boolean isPrivileged(Authentication auth) {
        return isManager(auth) || isStaff(auth);
    }

    public boolean isCustomer(Authentication auth) {
        return !isPrivileged(auth);
    }

    public String getRoleType(Authentication auth) {
        if (isManager(auth)) return "MANAGER";
        if (isStaff(auth)) return "STAFF";
        return "CUSTOMER";
    }
}