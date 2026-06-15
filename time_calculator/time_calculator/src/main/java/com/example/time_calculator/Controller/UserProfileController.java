package com.example.time_calculator.Controller;

import com.example.time_calculator.Service.UserProfileService;
import com.example.time_calculator.dto.UpdateUserProfileRequestDTO;
import com.example.time_calculator.dto.UserProfileResponseDTO;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Profile Controller
 *
 * GET  /api/profile          → fetch current user's profile
 * PUT  /api/profile          → update current user's profile
 *
 * Auth: cookie-based JWT (AUTH_TOKEN) — extracted by JwtFilter
 * Role: cannot be changed here
 * Password: cannot be changed here
 */
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService profileService;

    /* ===================================================
       GET /api/profile
    =================================================== */
//    @GetMapping
//    public ResponseEntity<UserProfileResponseDTO> getProfile() {
//        return ResponseEntity.ok(profileService.getCurrentUserProfile());
//    }

    @GetMapping
    public ResponseEntity<?> getProfile() {
        try {
            return ResponseEntity.ok(profileService.getCurrentUserProfile());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "PROFILE ERROR: " + e.getMessage()));
        }
    }

    /* ===================================================
       PUT /api/profile
    =================================================== */
    @PutMapping
    public ResponseEntity<?> updateProfile(
            @Valid @RequestBody UpdateUserProfileRequestDTO request
    ) {
        try {
            UserProfileResponseDTO updated = profileService.updateCurrentUserProfile(request);
            return ResponseEntity.ok(
                    Map.of(
                            "message", "Profile berhasil diperbarui",
                            "data", updated
                    )
            );
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

}
