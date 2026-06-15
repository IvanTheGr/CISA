package com.example.time_calculator.Service;

import com.example.time_calculator.Entity.PtapIncidentLog;
import com.example.time_calculator.Entity.ResUsers;
import com.example.time_calculator.Entity.SupportTicket;
import com.example.time_calculator.Repository.PtapIncidentLogRepository;
import com.example.time_calculator.Repository.ResUsersRepository;
import com.example.time_calculator.Repository.SupportTicketRepository;
import com.example.time_calculator.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class IncidentApprovalService {

    private final JdbcTemplate jdbcTemplate;
    private final ResUsersRepository resUsersRepository;
    private final SupportTicketRepository supportTicketRepository;
    private final PtapIncidentLogRepository incidentLogRepository;
    private final SupportTicketMessageService messageService;

    @Transactional(readOnly = true)
    public ManagerApprovalResponseDTO getApprovalList() {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                """
                SELECT
                    t.id,
                    t.ticket_number,
                    t.subject,
                    t.close_time,
                    COALESCE(parent.name, partner.name, '-') AS company_name,
                    COALESCE(partner.name, t.person_name, '-') AS customer_name,
                    COALESCE(pt.name, '-') AS product_name,
                    COALESCE(pr.name, '-') AS priority_name,
                    COALESCE(emp.name, pic_partner.name, '-') AS assigned_pic,
                    COALESCE(i.state, 'submit') AS incident_state
                FROM website_support_ticket t
                JOIN ptap_incident_log i
                    ON i.ticket_id = t.id
                LEFT JOIN res_partner partner
                    ON partner.id = t.partner_id
                LEFT JOIN res_partner parent
                    ON parent.id = partner.parent_id
                LEFT JOIN product_template pt
                    ON pt.id = t.product_id
                LEFT JOIN website_support_ticket_priority pr
                    ON pr.id = t.priority_id
                LEFT JOIN res_users u
                    ON u.id = t.user_id
                LEFT JOIN res_partner pic_partner
                    ON pic_partner.id = u.partner_id
                LEFT JOIN hr_employee emp
                    ON emp.user_id = u.id
                   AND emp.active = true
                ORDER BY COALESCE(t.close_time, t.create_date_time, t.create_date) DESC
                """
        );

        List<Long> ticketIds = rows.stream()
                .map(row -> toLong(row.get("id")))
                .filter(id -> id != null)
                .toList();

        Map<Long, CustomerRatingDTO> ratingMap = loadCustomerRatingsBulk(ticketIds);

        List<ManagerApprovalDTO> pending = new ArrayList<>();
        List<ManagerApprovalDTO> approved = new ArrayList<>();

        for (Map<String, Object> row : rows) {
            Long ticketId = toLong(row.get("id"));
            CustomerRatingDTO rating = ratingMap.get(ticketId);

            ManagerApprovalDTO item = ManagerApprovalDTO.builder()
                    .id(ticketId)
                    .ticketNumber(toStringValue(row.get("ticket_number")))
                    .subject(toStringValue(row.get("subject")))
                    .companyName(toStringValue(row.get("company_name")))
                    .customerName(toStringValue(row.get("customer_name")))
                    .productName(toStringValue(row.get("product_name")))
                    .priorityName(toStringValue(row.get("priority_name")))
                    .assignedPic(toStringValue(row.get("assigned_pic")))
                    .incidentState(toStringValue(row.get("incident_state")))
                    .closeTime(toLocalDateTime(row.get("close_time")))
                    .customerRating(rating != null ? rating.getRating() : null)
                    .customerRatingText(rating != null ? rating.getRatingText() : "N/A")
                    .build();

            if (isApproved(item.getIncidentState())) {
                approved.add(item);
            } else {
                pending.add(item);
            }
        }

        return ManagerApprovalResponseDTO.builder()
                .pendingApproval(pending)
                .approved(approved)
                .build();
    }

    private Map<Long, CustomerRatingDTO> loadCustomerRatingsBulk(List<Long> ticketIds) {
        Map<Long, CustomerRatingDTO> result = new HashMap<>();

        if (ticketIds == null || ticketIds.isEmpty()) {
            return result;
        }

        try {
            if (!hasTable("ptap_pic_rating")) {
                return result;
            }

            boolean hasTicketId = hasColumn("ptap_pic_rating", "ticket_id");
            boolean hasSupportTicketId = hasColumn("ptap_pic_rating", "support_ticket_id");
            boolean hasPartnerId = hasColumn("ptap_pic_rating", "partner_id");

            /*
             * Bulk mode paling aman dan cepat:
             * prioritas pakai ticket_id.
             */
            if (hasTicketId) {
                String placeholders = ticketIds.stream()
                        .map(id -> "?")
                        .collect(java.util.stream.Collectors.joining(","));

                String sql = hasPartnerId
                        ? """
                    WITH latest_rating AS (
                        SELECT
                            r.*,
                            rp.name AS rating_partner_name,
                            ROW_NUMBER() OVER (
                                PARTITION BY r.ticket_id
                                ORDER BY r.id DESC
                            ) AS rn
                        FROM ptap_pic_rating r
                        LEFT JOIN res_partner rp
                               ON rp.id = r.partner_id
                        WHERE r.ticket_id IN (%s)
                    )
                    SELECT *
                    FROM latest_rating
                    WHERE rn = 1
                    """
                        : """
                    WITH latest_rating AS (
                        SELECT
                            r.*,
                            ROW_NUMBER() OVER (
                                PARTITION BY r.ticket_id
                                ORDER BY r.id DESC
                            ) AS rn
                        FROM ptap_pic_rating r
                        WHERE r.ticket_id IN (%s)
                    )
                    SELECT *
                    FROM latest_rating
                    WHERE rn = 1
                    """;

                String finalSql = String.format(sql, placeholders);

                List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                        finalSql,
                        ticketIds.toArray()
                );

                for (Map<String, Object> row : rows) {
                    Long ticketId = toLong(getValueIgnoreCase(row, "ticket_id"));

                    if (ticketId == null) continue;

                    CustomerRatingDTO rating = mapRatingRow(row);

                    if (rating != null) {
                        result.put(ticketId, rating);
                    }
                }

                return result;
            }

            /*
             * Fallback kalau kolomnya support_ticket_id.
             */
            if (hasSupportTicketId) {
                String placeholders = ticketIds.stream()
                        .map(id -> "?")
                        .collect(java.util.stream.Collectors.joining(","));

                String sql = hasPartnerId
                        ? """
                    WITH latest_rating AS (
                        SELECT
                            r.*,
                            rp.name AS rating_partner_name,
                            ROW_NUMBER() OVER (
                                PARTITION BY r.support_ticket_id
                                ORDER BY r.id DESC
                            ) AS rn
                        FROM ptap_pic_rating r
                        LEFT JOIN res_partner rp
                               ON rp.id = r.partner_id
                        WHERE r.support_ticket_id IN (%s)
                    )
                    SELECT *
                    FROM latest_rating
                    WHERE rn = 1
                    """
                        : """
                    WITH latest_rating AS (
                        SELECT
                            r.*,
                            ROW_NUMBER() OVER (
                                PARTITION BY r.support_ticket_id
                                ORDER BY r.id DESC
                            ) AS rn
                        FROM ptap_pic_rating r
                        WHERE r.support_ticket_id IN (%s)
                    )
                    SELECT *
                    FROM latest_rating
                    WHERE rn = 1
                    """;

                String finalSql = String.format(sql, placeholders);

                List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                        finalSql,
                        ticketIds.toArray()
                );

                for (Map<String, Object> row : rows) {
                    Long ticketId = toLong(getValueIgnoreCase(row, "support_ticket_id"));

                    if (ticketId == null) continue;

                    CustomerRatingDTO rating = mapRatingRow(row);

                    if (rating != null) {
                        result.put(ticketId, rating);
                    }
                }

                return result;
            }

            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return result;
        }
    }

    @Transactional(readOnly = true)
    public TicketHistoryDetailDTO getApprovalDetail(Long ticketId) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));

        PtapIncidentLog incidentLog = incidentLogRepository.findByTicket_Id(ticketId)
                .orElseThrow(() -> new RuntimeException("Incident log not found for ticket: " + ticketId));

        List<TicketMessageResponseDTO> messages =
                messageService.findSupportTicketMessageResponsesByTicketId(ticketId);

        CustomerRatingDTO rating = loadCustomerRating(ticketId);

        return TicketHistoryDetailDTO.builder()
                .id(ticket.getId())
                .ticketNumber(ticket.getTicketNumber())
                .subject(ticket.getSubject())

                .companyName(resolveCompanyName(ticket))
                .customerName(ticket.getPersonName())
                .email(ticket.getEmail())
                .productName(ticket.getProduct() != null ? ticket.getProduct().getName() : "-")
                .priorityName(ticket.getPriority() != null ? ticket.getPriority().getName() : "-")
                .assignedPic(resolvePic(ticket))
                .stateName(ticket.getStateName())
                .channel(ticket.getChannel())

                .createDateTime(ticket.getCreateDateTime())
                .createDate(ticket.getCreateDate())
                .closeTime(ticket.getCloseTime())
                .closeDate(ticket.getCloseDate())

                .responseTime(ticket.getResponseTime() != null ? String.valueOf(ticket.getResponseTime()) : "-")
                .resolutionTime(ticket.getResolutionTime() != null ? String.valueOf(ticket.getResolutionTime()) : "-")
                .responseToClose(ticket.getResponseToClose() != null ? String.valueOf(ticket.getResponseToClose()) : "-")

                .messages(messages)
                .incidentLog(mapIncidentLog(incidentLog))
                .customerRating(rating)
                .build();
    }

    @Transactional
    public String approveIncident(Long ticketId, String managerLogin) {
        ResUsers manager = resUsersRepository
                .findByLoginAndActiveTrue(managerLogin)
                .orElseThrow(() -> new RuntimeException("Manager user not found"));

        PtapIncidentLog incidentLog = incidentLogRepository.findByTicket_Id(ticketId)
                .orElseThrow(() -> new RuntimeException("Incident log not found for ticket: " + ticketId));

        StringBuilder sql = new StringBuilder("""
                UPDATE ptap_incident_log
                SET state = 'approve'
                """);

        List<Object> params = new ArrayList<>();

        if (hasColumn("ptap_incident_log", "write_date")) {
            sql.append(", write_date = NOW()");
        }

        if (hasColumn("ptap_incident_log", "write_uid")) {
            sql.append(", write_uid = ?");
            params.add(manager.getId());
        }

        if (hasColumn("ptap_incident_log", "approved_by")) {
            sql.append(", approved_by = ?");
            params.add(manager.getId());
        }

        if (hasColumn("ptap_incident_log", "approved_uid")) {
            sql.append(", approved_uid = ?");
            params.add(manager.getId());
        }

        if (hasColumn("ptap_incident_log", "approved_at")) {
            sql.append(", approved_at = NOW()");
        }

        sql.append(" WHERE id = ?");
        params.add(incidentLog.getId());

        int updated = jdbcTemplate.update(sql.toString(), params.toArray());

        if (updated == 0) {
            throw new RuntimeException("Failed approve incident log for ticket: " + ticketId);
        }

        return "Incident Log berhasil di-approve";
    }

    private IncidentLogResponseDTO mapIncidentLog(PtapIncidentLog log) {
        return IncidentLogResponseDTO.builder()
                .id(log.getId())
                .issue(log.getIssue())
                .impact(log.getImpact())
                .environment(log.getEnvironment())
                .chronology(log.getChronology())
                .rootCause(log.getRootCause())
                .workaround(log.getWorkaround())
                .recommendation(log.getRecommendation())
                .notes(log.getNotes())
                .permanentSolution(log.getPermanentSolution())
                .state(log.getState())
                .build();
    }

    private boolean isApproved(String state) {
        if (state == null) return false;

        String normalized = state.trim().toLowerCase();

        return normalized.equals("approve")
                || normalized.equals("approved")
                || normalized.equals("manager_approved");
    }

    private String resolveCompanyName(SupportTicket ticket) {
        try {
            if (ticket.getPartner() != null && ticket.getPartner().getParent() != null) {
                return ticket.getPartner().getParent().getName();
            }

            if (ticket.getPartner() != null) {
                return ticket.getPartner().getName();
            }
        } catch (Exception ignored) {
        }

        return "-";
    }

    private String resolvePic(SupportTicket ticket) {
        try {
            if (ticket.getPicName() != null && !ticket.getPicName().isBlank()) {
                return ticket.getPicName();
            }
        } catch (Exception ignored) {
        }

        try {
            if (ticket.getUser() != null && ticket.getUser().getPartner() != null) {
                return ticket.getUser().getPartner().getName();
            }
        } catch (Exception ignored) {
        }

        return "-";
    }

    private CustomerRatingDTO loadCustomerRating(Long ticketId) {
        if (ticketId == null) return null;

        try {
            SupportTicket ticket = supportTicketRepository.findById(ticketId).orElse(null);
            String ticketNumber = ticket != null ? ticket.getTicketNumber() : null;

            boolean hasPartnerId = hasColumn("ptap_pic_rating", "partner_id");

            List<String> conditions = new ArrayList<>();
            List<Object> params = new ArrayList<>();

            if (hasColumn("ptap_pic_rating", "ticket_id")) {
                conditions.add("r.ticket_id = ?");
                params.add(ticketId);
            }

            if (hasColumn("ptap_pic_rating", "support_ticket_id")) {
                conditions.add("r.support_ticket_id = ?");
                params.add(ticketId);
            }

            if (ticketNumber != null && hasColumn("ptap_pic_rating", "ticket_number")) {
                conditions.add("CAST(r.ticket_number AS TEXT) = ?");
                params.add(ticketNumber);
            }

            if (conditions.isEmpty()) {
                return loadCustomerRatingFromOdooRating(ticketId);
            }

            String selectSql = hasPartnerId
                    ? """
                    SELECT
                        r.*,
                        rp.name AS rating_partner_name
                    FROM ptap_pic_rating r
                    LEFT JOIN res_partner rp
                           ON rp.id = r.partner_id
                    WHERE %s
                    ORDER BY r.id DESC
                    LIMIT 1
                    """
                    : """
                    SELECT
                        r.*
                    FROM ptap_pic_rating r
                    WHERE %s
                    ORDER BY r.id DESC
                    LIMIT 1
                    """;

            String sql = String.format(selectSql, String.join(" OR ", conditions));

            List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, params.toArray());

            if (rows.isEmpty()) {
                return loadCustomerRatingFromOdooRating(ticketId);
            }

            CustomerRatingDTO result = mapRatingRow(rows.get(0));

            if (result == null || result.getRating() == null) {
                CustomerRatingDTO fallback = loadCustomerRatingFromOdooRating(ticketId);
                if (fallback != null && fallback.getRating() != null) {
                    return fallback;
                }
            }

            return result;

        } catch (Exception e) {
            return loadCustomerRatingFromOdooRating(ticketId);
        }
    }

    private CustomerRatingDTO loadCustomerRatingFromOdooRating(Long ticketId) {
        if (ticketId == null) return null;

        try {
            if (!hasTable("rating_rating")) {
                return null;
            }

            List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                    """
                    SELECT
                        rr.*,
                        rp.name AS rating_partner_name
                    FROM rating_rating rr
                    LEFT JOIN res_partner rp
                           ON rp.id = rr.partner_id
                    WHERE rr.res_id = ?
                      AND (
                            rr.res_model = 'website.support.ticket'
                            OR rr.res_model = 'website_support_ticket'
                            OR rr.res_model IS NULL
                      )
                    ORDER BY rr.id DESC
                    LIMIT 1
                    """,
                    ticketId
            );

            if (rows.isEmpty()) {
                return null;
            }

            return mapRatingRow(rows.get(0));

        } catch (Exception e) {
            return null;
        }
    }

    private CustomerRatingDTO mapRatingRow(Map<String, Object> row) {
        if (row == null || row.isEmpty()) return null;

        Integer rating = firstIntegerIgnoreCase(row,
                "rating",
                "rate",
                "score",
                "stars",
                "rating_value",
                "nilai",
                "value",
                "pic_rating",
                "customer_rating",
                "rating_score",
                "rating_avg"
        );

        String comment = firstStringIgnoreCase(row,
                "comment",
                "comments",
                "feedback",
                "notes",
                "description",
                "review",
                "message"
        );

        String customerName = resolveRatingCustomerName(row);

        LocalDateTime createDate = firstDateTimeIgnoreCase(row,
                "create_date",
                "write_date",
                "created_at",
                "date"
        );

        return CustomerRatingDTO.builder()
                .rating(rating)
                .ratingText(rating != null ? rating + " / 5" : "N/A")
                .comment(comment != null ? comment : "-")
                .customerName(customerName != null ? customerName : "-")
                .createDate(createDate)
                .build();
    }

    private String resolveRatingCustomerName(Map<String, Object> row) {
        String joinedName = firstStringIgnoreCase(row, "rating_partner_name");

        if (joinedName != null && !isNumeric(joinedName)) {
            return joinedName;
        }

        Long partnerId = firstLongIgnoreCase(row,
                "partner_id",
                "customer_id",
                "res_partner_id",
                "rating_partner_id"
        );

        if (partnerId == null) {
            String possiblePartnerId = firstStringIgnoreCase(row,
                    "customer_name",
                    "partner_name",
                    "name",
                    "display_name"
            );

            if (isNumeric(possiblePartnerId)) {
                try {
                    partnerId = Long.parseLong(possiblePartnerId);
                } catch (Exception ignored) {
                }
            } else if (possiblePartnerId != null) {
                return possiblePartnerId;
            }
        }

        if (partnerId != null) {
            String partnerName = findPartnerNameById(partnerId);

            if (partnerName != null && !partnerName.isBlank()) {
                return partnerName;
            }
        }

        String fallbackName = firstStringIgnoreCase(row,
                "customer_name",
                "partner_name",
                "name",
                "display_name"
        );

        if (fallbackName != null && !isNumeric(fallbackName)) {
            return fallbackName;
        }

        return "-";
    }

    private String findPartnerNameById(Long partnerId) {
        if (partnerId == null) return null;

        try {
            return jdbcTemplate.queryForObject(
                    """
                    SELECT COALESCE(NULLIF(display_name, ''), NULLIF(name, ''), '-')
                    FROM res_partner
                    WHERE id = ?
                    LIMIT 1
                    """,
                    String.class,
                    partnerId
            );
        } catch (Exception e) {
            return null;
        }
    }

    private boolean hasTable(String tableName) {
        try {
            Boolean exists = jdbcTemplate.queryForObject(
                    """
                    SELECT EXISTS (
                        SELECT 1
                        FROM information_schema.tables
                        WHERE table_name = ?
                    )
                    """,
                    Boolean.class,
                    tableName
            );

            return Boolean.TRUE.equals(exists);
        } catch (Exception e) {
            return false;
        }
    }

    private boolean hasColumn(String tableName, String columnName) {
        try {
            Boolean exists = jdbcTemplate.queryForObject(
                    """
                    SELECT EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_name = ?
                          AND column_name = ?
                    )
                    """,
                    Boolean.class,
                    tableName,
                    columnName
            );

            return Boolean.TRUE.equals(exists);
        } catch (Exception e) {
            return false;
        }
    }

    private Object getValueIgnoreCase(Map<String, Object> row, String key) {
        if (row == null || key == null) return null;

        for (Map.Entry<String, Object> entry : row.entrySet()) {
            if (entry.getKey() != null && entry.getKey().equalsIgnoreCase(key)) {
                return entry.getValue();
            }
        }

        return null;
    }

    private Integer firstIntegerIgnoreCase(Map<String, Object> row, String... keys) {
        for (String key : keys) {
            Object value = getValueIgnoreCase(row, key);

            if (value == null) continue;

            if (value instanceof Integer integer) {
                return integer;
            }

            if (value instanceof Long longValue) {
                return normalizeRatingNumber(longValue.doubleValue());
            }

            if (value instanceof Double doubleValue) {
                return normalizeRatingNumber(doubleValue);
            }

            if (value instanceof Float floatValue) {
                return normalizeRatingNumber(floatValue.doubleValue());
            }

            if (value instanceof BigDecimal bigDecimal) {
                return normalizeRatingNumber(bigDecimal.doubleValue());
            }

            if (value instanceof Number number) {
                return normalizeRatingNumber(number.doubleValue());
            }

            try {
                return normalizeRatingNumber(Double.parseDouble(String.valueOf(value)));
            } catch (Exception ignored) {
            }
        }

        return null;
    }

    private Integer normalizeRatingNumber(Double value) {
        if (value == null) return null;

        int rounded = (int) Math.round(value);

        if (rounded > 5 && rounded <= 10) {
            rounded = (int) Math.round(value / 2.0);
        }

        if (rounded > 10 && rounded <= 100) {
            rounded = (int) Math.round(value / 20.0);
        }

        if (rounded < 1) return null;
        if (rounded > 5) return 5;

        return rounded;
    }

    private String firstStringIgnoreCase(Map<String, Object> row, String... keys) {
        for (String key : keys) {
            Object value = getValueIgnoreCase(row, key);

            if (value != null && !String.valueOf(value).isBlank()) {
                return String.valueOf(value);
            }
        }

        return null;
    }

    private LocalDateTime firstDateTimeIgnoreCase(Map<String, Object> row, String... keys) {
        for (String key : keys) {
            Object value = getValueIgnoreCase(row, key);
            LocalDateTime dateTime = toLocalDateTime(value);

            if (dateTime != null) {
                return dateTime;
            }
        }

        return null;
    }

    private Long firstLongIgnoreCase(Map<String, Object> row, String... keys) {
        for (String key : keys) {
            Object value = getValueIgnoreCase(row, key);

            if (value == null) continue;

            if (value instanceof Number number) {
                return number.longValue();
            }

            try {
                return Long.parseLong(String.valueOf(value));
            } catch (Exception ignored) {
            }
        }

        return null;
    }

    private boolean isNumeric(String value) {
        if (value == null) return false;

        String cleaned = value.trim();

        if (cleaned.isEmpty()) return false;

        try {
            Long.parseLong(cleaned);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private Long toLong(Object value) {
        if (value instanceof Number number) return number.longValue();

        if (value != null) {
            try {
                return Long.parseLong(String.valueOf(value));
            } catch (Exception ignored) {
            }
        }

        return null;
    }

    private String toStringValue(Object value) {
        if (value == null) return "-";
        return String.valueOf(value);
    }

    private LocalDateTime toLocalDateTime(Object value) {
        if (value == null) return null;

        if (value instanceof LocalDateTime localDateTime) {
            return localDateTime;
        }

        if (value instanceof Timestamp timestamp) {
            return timestamp.toLocalDateTime();
        }

        try {
            return Timestamp.valueOf(String.valueOf(value)).toLocalDateTime();
        } catch (Exception ignored) {
        }

        return null;
    }
}