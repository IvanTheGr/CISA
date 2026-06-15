package com.example.time_calculator.Controller;

import com.example.time_calculator.Service.RolePermissionService;
import com.example.time_calculator.dto.RolePermissionDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * RolePermissionController
 *
 * Base URL: /api/roles
 *
 * GET    /api/roles           — list all roles with permissions
 * GET    /api/roles/{id}      — get single role
 * POST   /api/roles           — create role
 * PUT    /api/roles/{id}      — update role permissions
 * DELETE /api/roles/{id}      — delete role
 */
@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RolePermissionController {

    private final RolePermissionService service;

    @GetMapping
    public ResponseEntity<List<RolePermissionDTO.RoleDetail>> listRoles() {
        return ResponseEntity.ok(service.listRoles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RolePermissionDTO.RoleDetail> getRole(@PathVariable Long id) {
        return ResponseEntity.ok(service.getRoleById(id));
    }

    @PostMapping
    public ResponseEntity<RolePermissionDTO.RoleDetail> createRole(
            @Valid @RequestBody RolePermissionDTO.CreateRoleRequest req
    ) {
        return ResponseEntity.ok(service.createRole(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RolePermissionDTO.RoleDetail> updateRole(
            @PathVariable Long id,
            @RequestBody RolePermissionDTO.UpdateRoleRequest req
    ) {
        return ResponseEntity.ok(service.updateRole(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) {
        service.deleteRole(id);
        return ResponseEntity.noContent().build();
    }
}
