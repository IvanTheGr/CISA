package com.example.time_calculator.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

public class RolePermissionDTO {

    /**
     * The permission modules visible in the UI.
     * These map to res_groups.name entries or categories.
     */
    public static final List<String> PERMISSION_MODULES = List.of(
        "Dashboard", "Products", "Customer Products", "Ticket", "SLA Config", "Setting"
    );

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PermissionEntry {
        private String module;
        private boolean canView;
        private boolean canEdit;
        private boolean canDelete;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoleDetail {
        private Long id;
        private String name;
        private List<PermissionEntry> permissions;
        private int userCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRoleRequest {
        @jakarta.validation.constraints.NotBlank
        private String roleName;

        // key = module name, value = {view, edit, delete}
        private Map<String, PermissionFlags> permissions;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRoleRequest {
        private String roleName;
        private Map<String, PermissionFlags> permissions;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PermissionFlags {
        private boolean view;
        private boolean edit;
        private boolean delete;
    }
}
