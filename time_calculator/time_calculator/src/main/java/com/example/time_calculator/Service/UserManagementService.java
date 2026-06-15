package com.example.time_calculator.Service;

import com.example.time_calculator.Entity.ResGroups;
import com.example.time_calculator.Entity.ResPartner;
import com.example.time_calculator.Entity.ResUsers;
import com.example.time_calculator.Repository.ResGroupsRepository;
import com.example.time_calculator.Repository.ResPartnerRepository;
import com.example.time_calculator.Repository.UserManagementRepository;
import com.example.time_calculator.dto.UserManagementDTO;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class UserManagementService {

    private final UserManagementRepository userRepo;
    private final ResPartnerRepository partnerRepo;
    private final ResGroupsRepository groupRepo;
    private final BCryptPasswordEncoder passwordEncoder;

    // ─── List all users (paginated) ──────────────────────────────────────────

    public UserManagementDTO.PagedUserResponse listUsers(int page, int size) {
        int offset = page * size;
        List<Object[]> rows = userRepo.findUsersWithDetails(size, offset);
        List<Object[]> allRows = userRepo.findAllUsersWithDetails();

        List<UserManagementDTO.UserListItem> items = new ArrayList<>();
        int counter = 1;
        for (Object[] row : rows) {
            items.add(mapRowToListItem(row, counter++));
        }

        long total = allRows.size();
        long online = allRows.stream().filter(r -> "Online".equals(computeStatus(r))).count();
        long inactive = allRows.stream().filter(r -> "Inactive".equals(computeStatus(r))).count();
        long pending = allRows.stream().filter(r -> "Pending".equals(computeStatus(r))).count();

        return UserManagementDTO.PagedUserResponse.builder()
                .data(items)
                .totalElements(total)
                .totalPages((int) Math.ceil((double) total / size))
                .currentPage(page)
                .pageSize(size)
                .summary(UserManagementDTO.UserSummary.builder()
                        .total(total)
                        .online(online)
                        .inactive(inactive)
                        .pending(pending)
                        .build())
                .build();
    }

    private UserManagementDTO.UserListItem mapRowToListItem(Object[] row, int seq) {
        Long id = toLong(row[0]);
        String login = str(row[1]);
        Boolean active = (Boolean) row[2];
        LocalDateTime createDate = toDateTime(row[3]);
        LocalDateTime writeDate = toDateTime(row[4]);
        String partnerName = str(row[5]);
        String email = str(row[6]);
        String phone = str(row[7]);
        String groupNamesRaw = str(row[8]);

        List<String> roles = new ArrayList<>();
        if (groupNamesRaw != null && !groupNamesRaw.isBlank()) {
            roles = Arrays.asList(groupNamesRaw.split(",\\s*"));
        }
        String primaryRole = roles.isEmpty() ? "—" : roles.get(0);

        String status = computeStatus(row);

        return UserManagementDTO.UserListItem.builder()
                .id(id)
                .userId("S" + String.format("%03d", seq))
                .fullName(partnerName)
                .email(email)
                .username(login)
                .phone(phone)
                .role(primaryRole)
                .roles(roles)
                .lastLogin(writeDate)
                .createdAt(createDate)
                .status(status)
                .active(active)
                .build();
    }

    private String computeStatus(Object[] row) {
        Boolean active = (Boolean) row[2];
        LocalDateTime writeDate = toDateTime(row[4]);

        if (active == null || !active) return "Inactive";
        if (writeDate == null) return "Pending";

        LocalDateTime now = LocalDateTime.now();
        long minutesAgo = java.time.Duration.between(writeDate, now).toMinutes();
        long daysAgo = java.time.Duration.between(writeDate, now).toDays();

        if (minutesAgo <= 5) return "Online";
        if (minutesAgo <= 60 * 24) return "Today";
        if (daysAgo <= 2) return "Recent";
        if (daysAgo <= 30) return "Idle";
        return "Pending";
    }

    // ─── Create User ─────────────────────────────────────────────────────────

    @Transactional
    public UserManagementDTO.UserListItem createUser(UserManagementDTO.CreateUserRequest req) {

        if (userRepo.existsByLogin(req.getUsername())) {
            throw new IllegalArgumentException("Username already exists: " + req.getUsername());
        }

        // 1. Create res_partner entry
        ResPartner partner = ResPartner.builder()
                .name(req.getFullName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .active(true)
                .isCompany(false)
                .build();
        partner = partnerRepo.save(partner);

        // 2. Create res_users entry
        String hashedPw = req.getPassword() != null && !req.getPassword().isBlank()
                ? passwordEncoder.encode(req.getPassword())
                : passwordEncoder.encode("changeme123");

        ResUsers user = new ResUsers();
        user.setLogin(req.getUsername());
        user.setPassword(hashedPw);
        user.setActive("active".equalsIgnoreCase(req.getStatus()));
        user.setCreateDate(LocalDateTime.now());
        user.setWriteDate(null); // never logged in yet = Pending
        user.setPartner(partner);

        user = userRepo.save(user);

        // 3. Assign to group
        if (req.getRoleId() != null) {
            groupRepo.removeUserFromAllGroups(user.getId());
            groupRepo.assignUserToGroup(req.getRoleId(), user.getId());
        }

        // Build response
        long totalCount = userRepo.countTotalUsers();
        return UserManagementDTO.UserListItem.builder()
                .id(user.getId())
                .userId("S" + String.format("%03d", totalCount))
                .fullName(req.getFullName())
                .email(req.getEmail())
                .username(req.getUsername())
                .phone(req.getPhone())
                .createdAt(user.getCreateDate())
                .status(user.getActive() ? "Pending" : "Inactive")
                .active(user.getActive())
                .build();
    }

    // ─── Update User ─────────────────────────────────────────────────────────

    @Transactional
    public UserManagementDTO.UserListItem updateUser(Long userId, UserManagementDTO.UpdateUserRequest req) {

        ResUsers user = userRepo.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found: " + userId));

        ResPartner partner = user.getPartner();

        if (req.getFullName() != null) partner.setName(req.getFullName());
        if (req.getEmail() != null) partner.setEmail(req.getEmail());
        if (req.getPhone() != null) partner.setPhone(req.getPhone());
        partnerRepo.save(partner);

        if (req.getStatus() != null) {
            user.setActive("active".equalsIgnoreCase(req.getStatus()));
        }
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(req.getPassword()));
        }
        userRepo.save(user);

        if (req.getRoleId() != null) {
            groupRepo.removeUserFromAllGroups(userId);
            groupRepo.assignUserToGroup(req.getRoleId(), userId);
        }

        return UserManagementDTO.UserListItem.builder()
                .id(user.getId())
                .fullName(partner.getName())
                .email(partner.getEmail())
                .username(user.getLogin())
                .phone(partner.getPhone())
                .active(user.getActive())
                .build();
    }

    // ─── Delete User ─────────────────────────────────────────────────────────

    @Transactional
    public void deleteUser(Long userId) {
        ResUsers user = userRepo.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found: " + userId));
        groupRepo.removeUserFromAllGroups(userId);
        // soft delete: deactivate instead of hard delete to preserve referential integrity
        user.setActive(false);
        userRepo.save(user);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private Long toLong(Object o) {
        if (o == null) return null;
        if (o instanceof Long l) return l;
        if (o instanceof Integer i) return i.longValue();
        if (o instanceof Number n) return n.longValue();
        return Long.parseLong(o.toString());
    }

    private String str(Object o) { return o == null ? null : o.toString(); }

    private LocalDateTime toDateTime(Object o) {
        if (o == null) return null;
        if (o instanceof LocalDateTime ldt) return ldt;
        if (o instanceof java.sql.Timestamp ts) return ts.toLocalDateTime();
        return null;
    }
}
