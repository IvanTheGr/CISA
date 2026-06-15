package com.example.time_calculator.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Payload for PUT /api/profile
 * Matches the "Change My Preferences" form fields in the UI template.
 *
 * Excluded intentionally:
 *   - password  → handled by separate endpoint / Odoo
 *   - roles     → cannot be changed by user
 *   - login     → immutable
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserProfileRequestDTO {

    /** res_partner.name */
    private String fullName;

    /** res_partner.email */
    @Email(message = "Format email tidak valid")
    private String email;

    /** res_partner.phone */
    @Pattern(
            regexp = "^(\\+62|62|0)[0-9]{8,13}$|^$",
            message = "Format nomor telepon tidak valid (contoh: 08123456789)"
    )
    private String phone;

    /** res_users.notification_type → "handle_by_emails" or "inbox" */
    private String notificationType;

    /** res_users.chatter_position → "normal" or "sided" */
    private String chatterPosition;

    /** res_users.signature → HTML */
    private String signature;

    /** Optional: res_users.tz */
    private String timezone;

    // language is display-only (English) — not editable via this endpoint
}
