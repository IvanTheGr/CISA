package com.example.time_calculator.Service;

import com.example.time_calculator.Entity.ResGroups;
import com.example.time_calculator.Repository.ResGroupsRepository;
import com.example.time_calculator.dto.RolePermissionDTO;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * RolePermissionService manages res_groups entities.
 *
 * Permission matrix (Dashboard / Products / Customer Products / Ticket / SLA Config / Setting)
 * is stored as separate child groups in res_groups using a naming convention:
 *   "{roleName}::Dashboard::view", "{roleName}::Dashboard::edit", etc.
 *
 * This avoids modifying the DB schema while keeping the permission model explicit.
 * Alternatively, if a separate permission table exists, this service can be adapted.
 */
@Service
@RequiredArgsConstructor
public class RolePermissionService {

    private final ResGroupsRepository groupRepo;

    private static final String PERM_SEPARATOR = "::";
    private static final String SUFFIX_VIEW   = "view";
    private static final String SUFFIX_EDIT   = "edit";
    private static final String SUFFIX_DELETE  = "delete";

    // ─── List all roles ───────────────────────────────────────────────────────

    public List<RolePermissionDTO.RoleDetail> listRoles() {
        List<ResGroups> allGroups = groupRepo.findAll();

        // Identify "root" roles (groups that don't contain PERM_SEPARATOR)
        Map<String, ResGroups> rootRoles = new LinkedHashMap<>();
        for (ResGroups g : allGroups) {
            if (g.getName() != null && !g.getName().contains(PERM_SEPARATOR)) {
                rootRoles.put(g.getName(), g);
            }
        }

        List<RolePermissionDTO.RoleDetail> result = new ArrayList<>();
        for (Map.Entry<String, ResGroups> entry : rootRoles.entrySet()) {
            result.add(buildRoleDetail(entry.getValue(), allGroups));
        }
        return result;
    }

    public RolePermissionDTO.RoleDetail getRoleById(Long id) {
        ResGroups group = groupRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Role not found: " + id));
        List<ResGroups> all = groupRepo.findAll();
        return buildRoleDetail(group, all);
    }

    // ─── Create Role ──────────────────────────────────────────────────────────

    @Transactional
    public RolePermissionDTO.RoleDetail createRole(RolePermissionDTO.CreateRoleRequest req) {
        if (groupRepo.existsByName(req.getRoleName())) {
            throw new IllegalArgumentException("Role already exists: " + req.getRoleName());
        }

        // Create the root role group
        ResGroups root = new ResGroups();
        root.setName(req.getRoleName());
        root.setShare(false);
        root = groupRepo.save(root);

        // Create permission sub-groups
        savePermissionSubGroups(req.getRoleName(), req.getPermissions());

        return getRoleById(root.getId());
    }

    // ─── Update Role ──────────────────────────────────────────────────────────

    @Transactional
    public RolePermissionDTO.RoleDetail updateRole(Long id, RolePermissionDTO.UpdateRoleRequest req) {
        ResGroups root = groupRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Role not found: " + id));

        String oldName = root.getName();

        if (req.getRoleName() != null && !req.getRoleName().equals(oldName)) {
            root.setName(req.getRoleName());
            groupRepo.save(root);
        }

        String activeName = root.getName();

        if (req.getPermissions() != null) {
            // Delete old permission sub-groups for this role
            List<ResGroups> all = groupRepo.findAll();
            for (ResGroups g : all) {
                if (g.getName() != null && g.getName().startsWith(oldName + PERM_SEPARATOR)) {
                    groupRepo.delete(g);
                }
            }
            savePermissionSubGroups(activeName, req.getPermissions());
        }

        return getRoleById(id);
    }

    // ─── Delete Role ──────────────────────────────────────────────────────────

    @Transactional
    public void deleteRole(Long id) {
        ResGroups root = groupRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Role not found: " + id));

        String roleName = root.getName();

        // Remove all permission sub-groups
        List<ResGroups> all = groupRepo.findAll();
        for (ResGroups g : all) {
            if (g.getName() != null && g.getName().startsWith(roleName + PERM_SEPARATOR)) {
                groupRepo.delete(g);
            }
        }
        groupRepo.delete(root);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private void savePermissionSubGroups(String roleName, Map<String, RolePermissionDTO.PermissionFlags> permissions) {
        if (permissions == null) return;
        for (String module : RolePermissionDTO.PERMISSION_MODULES) {
            RolePermissionDTO.PermissionFlags flags = permissions.getOrDefault(module,
                    new RolePermissionDTO.PermissionFlags(false, false, false));

            saveOrUpdateSubGroup(roleName + PERM_SEPARATOR + module + PERM_SEPARATOR + SUFFIX_VIEW,   flags.isView());
            saveOrUpdateSubGroup(roleName + PERM_SEPARATOR + module + PERM_SEPARATOR + SUFFIX_EDIT,   flags.isEdit());
            saveOrUpdateSubGroup(roleName + PERM_SEPARATOR + module + PERM_SEPARATOR + SUFFIX_DELETE, flags.isDelete());
        }
    }

    private void saveOrUpdateSubGroup(String name, boolean enabled) {
        if (!enabled) return; // only persist "granted" permissions
        Optional<ResGroups> existing = groupRepo.findByName(name);
        if (existing.isEmpty()) {
            ResGroups g = new ResGroups();
            g.setName(name);
            g.setShare(false);
            groupRepo.save(g);
        }
    }

    private RolePermissionDTO.RoleDetail buildRoleDetail(ResGroups root, List<ResGroups> allGroups) {
        String roleName = root.getName();
        int userCount = groupRepo.countUsersByGroupId(root.getId());

        List<RolePermissionDTO.PermissionEntry> permissions = new ArrayList<>();
        for (String module : RolePermissionDTO.PERMISSION_MODULES) {
            String viewKey   = roleName + PERM_SEPARATOR + module + PERM_SEPARATOR + SUFFIX_VIEW;
            String editKey   = roleName + PERM_SEPARATOR + module + PERM_SEPARATOR + SUFFIX_EDIT;
            String deleteKey = roleName + PERM_SEPARATOR + module + PERM_SEPARATOR + SUFFIX_DELETE;

            boolean hasView   = allGroups.stream().anyMatch(g -> viewKey.equals(g.getName()));
            boolean hasEdit   = allGroups.stream().anyMatch(g -> editKey.equals(g.getName()));
            boolean hasDelete = allGroups.stream().anyMatch(g -> deleteKey.equals(g.getName()));

            permissions.add(RolePermissionDTO.PermissionEntry.builder()
                    .module(module)
                    .canView(hasView)
                    .canEdit(hasEdit)
                    .canDelete(hasDelete)
                    .build());
        }

        return RolePermissionDTO.RoleDetail.builder()
                .id(root.getId())
                .name(roleName)
                .permissions(permissions)
                .userCount(userCount)
                .build();
    }
}
