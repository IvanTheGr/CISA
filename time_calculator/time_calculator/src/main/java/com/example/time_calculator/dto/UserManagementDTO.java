package com.example.time_calculator.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

public class UserManagementDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserListItem {
        private Long id;
        private String userId;         // formatted: S001, S002...
        private String fullName;
        private String email;
        private String username;       // login
        private String phone;
        private String role;           // primary group name
        private List<String> roles;    // all group names
        private LocalDateTime lastLogin;
        private LocalDateTime createdAt;
        private String status;         // Online | Inactive | Recent | Today | Idle | Pending
        private Boolean active;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSummary {
        private long total;
        private long online;
        private long inactive;
        private long pending;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateUserRequest {
        @jakarta.validation.constraints.NotBlank
        private String fullName;

        @jakarta.validation.constraints.NotBlank
        private String username;

        @jakarta.validation.constraints.NotBlank
        @jakarta.validation.constraints.Email
        private String email;

        @jakarta.validation.constraints.NotBlank
        private String phone;

        @jakarta.validation.constraints.NotNull
        private Long roleId;

        @jakarta.validation.constraints.NotBlank
        private String status;  // active | inactive

        private String password;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateUserRequest {
        private String fullName;
        private String email;
        private String phone;
        private Long roleId;
        private String status;
        private String password;  // optional; if blank, don't update
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PagedUserResponse {
        private List<UserListItem> data;
        private long totalElements;
        private int totalPages;
        private int currentPage;
        private int pageSize;
        private UserSummary summary;
    }
}
