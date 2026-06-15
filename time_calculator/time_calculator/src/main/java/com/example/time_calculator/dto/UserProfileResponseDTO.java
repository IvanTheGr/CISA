package com.example.time_calculator.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO returned by GET /api/profile
 * Maps to the "Change My Preferences" UI (Odoo-style).
 *
 * Editable fields (shown in form):
 *   - fullName          → res_partner.name
 *   - email             → res_partner.email  (also shown in Email Preferences)
 *   - language          → static "English" for now (read/editable)
 *   - timezone          → res_users.tz  (if stored) or default Asia/Jakarta
 *   - notificationType  → res_users.notification_type  (handle_by_emails | inbox)
 *   - chatterPosition   → res_users.chatter_position   (normal | sided)
 *   - signature         → res_users.signature          (HTML rich text)
 *   - phone             → res_partner.phone
 *
 * Read-only display:
 *   - roles             → res_groups names
 *   - createdAt         → res_users.create_date
 *   - updatedAt         → res_users.write_date
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponseDTO {

    private Long   id;
    private String fullName;           // res_partner.name  — displayed as page title
    private String email;              // res_partner.email or fallback to login
    private String login;              // res_users.login   — read-only

    // Preferences panel fields
    private String language;           // e.g. "English"
    private String timezone;           // e.g. "Asia/Jakarta"

    // Email Preferences
    private String notificationType;   // "handle_by_emails" | "inbox"
    private String chatterPosition;    // "normal" | "sided"
    private String signature;          // HTML string

    // Phone
    private String phone;              // res_partner.phone

    // System info (read-only)
    private List<String> roles;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
