package com.example.time_calculator.Controller;

import com.example.time_calculator.Service.UserManagementService;
import com.example.time_calculator.dto.UserManagementDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * UserManagementController
 *
 * Base URL: /api/users
 *
 * GET    /api/users?page=0&size=10        — list users (paginated)
 * POST   /api/users                       — create user
 * PUT    /api/users/{id}                  — update user
 * DELETE /api/users/{id}                  — soft-delete user
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserManagementController {

    private final UserManagementService service;

    @GetMapping
    public ResponseEntity<UserManagementDTO.PagedUserResponse> listUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(service.listUsers(page, size));
    }

    @PostMapping
    public ResponseEntity<UserManagementDTO.UserListItem> createUser(
            @Valid @RequestBody UserManagementDTO.CreateUserRequest req
    ) {
        return ResponseEntity.ok(service.createUser(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserManagementDTO.UserListItem> updateUser(
            @PathVariable Long id,
            @RequestBody UserManagementDTO.UpdateUserRequest req
    ) {
        return ResponseEntity.ok(service.updateUser(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        service.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
