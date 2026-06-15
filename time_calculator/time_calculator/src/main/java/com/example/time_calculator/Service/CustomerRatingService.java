package com.example.time_calculator.Service;

import com.example.time_calculator.Entity.ResUsers;
import com.example.time_calculator.Entity.SupportTicket;
import com.example.time_calculator.Repository.ResUsersRepository;
import com.example.time_calculator.Repository.SupportTicketRepository;
import com.example.time_calculator.dto.CustomerRatingPageDTO;
import com.example.time_calculator.dto.CustomerRatingSubmitDTO;
import com.example.time_calculator.dto.CustomerRatingTicketDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class CustomerRatingService {

    private final JdbcTemplate jdbcTemplate;
    private final ResUsersRepository resUsersRepository;
    private final SupportTicketRepository supportTicketRepository;

    @Transactional(readOnly = true)
    public CustomerRatingPageDTO getMyRatingPage(String login) {
        ResUsers currentUser = resUsersRepository
                .findByLoginAndActiveTrue(login)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getPartner() == null || currentUser.getPartner().getId() == null) {
            throw new RuntimeException("User partner not found");
        }

        Long partnerId = currentUser.getPartner().getId();

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                """
                SELECT
                    t.id,
                    t.ticket_number,
                    t.subject,
                    t.person_name,
                    t.state_name,
                    t.create_date_time,
                    t.close_time,
                    COALESCE(parent.name, partner.name, '-') AS company_name,
                    COALESCE(partner.name, t.person_name, '-') AS customer_name,
                    COALESCE(pt.name, '-') AS product_name,
                    COALESCE(pr.name, '-') AS priority_name
                FROM website_support_ticket t
                LEFT JOIN res_partner partner
                    ON partner.id = t.partner_id
                LEFT JOIN res_partner parent
                    ON parent.id = partner.parent_id
                LEFT JOIN product_template pt
                    ON pt.id = t.product_id
                LEFT JOIN website_support_ticket_priority pr
                    ON pr.id = t.priority_id
                WHERE
                    (
                        t.partner_id = ?
                        OR partner.parent_id = ?
                        OR partner.commercial_partner_id = ?
                    )
                    AND (
                        t.close_time IS NOT NULL
                        OR LOWER(COALESCE(t.state_name, '')) LIKE '%closed%'
                    )
                ORDER BY COALESCE(t.close_time, t.create_date_time, t.create_date) DESC
                """,
                partnerId,
                partnerId,
                partnerId
        );

        List<Long> ticketIds = rows.stream()
                .map(row -> toLong(row.get("id")))
                .filter(Objects::nonNull)
                .toList();

        Map<Long, RatingData> ratingMap = loadRatingsBulk(ticketIds);

        List<CustomerRatingTicketDTO> pendingRating = new ArrayList<>();
        List<CustomerRatingTicketDTO> ratingHistory = new ArrayList<>();

        for (Map<String, Object> row : rows) {
            Long ticketId = toLong(row.get("id"));
            RatingData rating = ratingMap.get(ticketId);

            CustomerRatingTicketDTO item = CustomerRatingTicketDTO.builder()
                    .id(ticketId)
                    .ticketNumber(toStringValue(row.get("ticket_number")))
                    .subject(toStringValue(row.get("subject")))
                    .companyName(toStringValue(row.get("company_name")))
                    .customerName(toStringValue(row.get("customer_name")))
                    .productName(toStringValue(row.get("product_name")))
                    .priorityName(toStringValue(row.get("priority_name")))
                    .stateName(toStringValue(row.get("state_name")))
                    .createDateTime(toLocalDateTime(row.get("create_date_time")))
                    .closeTime(toLocalDateTime(row.get("close_time")))
                    .rating(rating != null ? rating.rating() : null)
                    .ratingText(rating != null ? rating.ratingText() : "N/A")
                    .comment(rating != null ? rating.comment() : "-")
                    .ratingDate(rating != null ? rating.createDate() : null)
                    .build();

            if (rating == null || rating.rating() == null) {
                pendingRating.add(item);
            } else {
                ratingHistory.add(item);
            }
        }

        return CustomerRatingPageDTO.builder()
                .pendingRating(pendingRating)
                .ratingHistory(ratingHistory)
                .build();
    }

    @Transactional
    public String submitRating(Long ticketId, CustomerRatingSubmitDTO dto, String login) {
        ResUsers currentUser = resUsersRepository
                .findByLoginAndActiveTrue(login)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getPartner() == null || currentUser.getPartner().getId() == null) {
            throw new RuntimeException("User partner not found");
        }

        Long partnerId = currentUser.getPartner().getId();

        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));

        if (!isTicketBelongsToCustomer(ticketId, partnerId)) {
            throw new RuntimeException("You are not allowed to rate this ticket");
        }

        if (!hasTable("ptap_pic_rating")) {
            throw new RuntimeException("Table ptap_pic_rating not found");
        }

        String ratingColumn = firstExistingColumn(
                "ptap_pic_rating",
                "rating",
                "rate",
                "score",
                "stars",
                "rating_value",
                "nilai",
                "value",
                "pic_rating",
                "customer_rating",
                "rating_score"
        );

        if (ratingColumn == null) {
            throw new RuntimeException("Rating column not found in ptap_pic_rating");
        }

        String commentColumn = firstExistingColumn(
                "ptap_pic_rating",
                "comment",
                "comments",
                "feedback",
                "notes",
                "description",
                "review",
                "message"
        );

        Long existingRatingId = findExistingRatingId(ticketId, partnerId);

        if (existingRatingId != null) {
            updateExistingRating(existingRatingId, ratingColumn, commentColumn, dto, currentUser.getId());
            return "Rating berhasil diperbarui";
        }

        insertNewRating(ticket, partnerId, ratingColumn, commentColumn, dto, currentUser.getId());

        return "Rating berhasil disimpan";
    }

    private boolean isTicketBelongsToCustomer(Long ticketId, Long partnerId) {
        try {
            Integer count = jdbcTemplate.queryForObject(
                    """
                    SELECT COUNT(*)
                    FROM website_support_ticket t
                    LEFT JOIN res_partner partner
                        ON partner.id = t.partner_id
                    WHERE t.id = ?
                      AND (
                            t.partner_id = ?
                            OR partner.parent_id = ?
                            OR partner.commercial_partner_id = ?
                      )
                    """,
                    Integer.class,
                    ticketId,
                    partnerId,
                    partnerId,
                    partnerId
            );

            return count != null && count > 0;
        } catch (Exception e) {
            return false;
        }
    }

    private Long findExistingRatingId(Long ticketId, Long partnerId) {
        try {
            if (!hasColumn("ptap_pic_rating", "ticket_id")) {
                return null;
            }

            if (hasColumn("ptap_pic_rating", "partner_id")) {
                List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                        """
                        SELECT id
                        FROM ptap_pic_rating
                        WHERE ticket_id = ?
                          AND partner_id = ?
                        ORDER BY id DESC
                        LIMIT 1
                        """,
                        ticketId,
                        partnerId
                );

                if (!rows.isEmpty()) {
                    return toLong(rows.get(0).get("id"));
                }
            }

            List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                    """
                    SELECT id
                    FROM ptap_pic_rating
                    WHERE ticket_id = ?
                    ORDER BY id DESC
                    LIMIT 1
                    """,
                    ticketId
            );

            if (rows.isEmpty()) return null;

            return toLong(rows.get(0).get("id"));
        } catch (Exception e) {
            return null;
        }
    }

    private void updateExistingRating(
            Long ratingId,
            String ratingColumn,
            String commentColumn,
            CustomerRatingSubmitDTO dto,
            Long userId
    ) {
        StringBuilder sql = new StringBuilder("UPDATE ptap_pic_rating SET ");
        List<String> sets = new ArrayList<>();
        List<Object> params = new ArrayList<>();

        sets.add(ratingColumn + " = ?");
        params.add(dto.getRating());

        if (commentColumn != null) {
            sets.add(commentColumn + " = ?");
            params.add(dto.getComment());
        }

        if (hasColumn("ptap_pic_rating", "write_uid")) {
            sets.add("write_uid = ?");
            params.add(userId);
        }

        if (hasColumn("ptap_pic_rating", "write_date")) {
            sets.add("write_date = NOW()");
        }

        sql.append(String.join(", ", sets));
        sql.append(" WHERE id = ?");
        params.add(ratingId);

        jdbcTemplate.update(sql.toString(), params.toArray());
    }

    private void insertNewRating(
            SupportTicket ticket,
            Long partnerId,
            String ratingColumn,
            String commentColumn,
            CustomerRatingSubmitDTO dto,
            Long userId
    ) {
        List<String> columns = new ArrayList<>();
        List<Object> values = new ArrayList<>();

        if (hasColumn("ptap_pic_rating", "ticket_id")) {
            columns.add("ticket_id");
            values.add(ticket.getId());
        }

        if (hasColumn("ptap_pic_rating", "ticket_number")) {
            columns.add("ticket_number");
            values.add(ticket.getTicketNumber());
        }

        if (hasColumn("ptap_pic_rating", "partner_id")) {
            columns.add("partner_id");
            values.add(partnerId);
        }

        columns.add(ratingColumn);
        values.add(dto.getRating());

        if (commentColumn != null) {
            columns.add(commentColumn);
            values.add(dto.getComment());
        }

        if (hasColumn("ptap_pic_rating", "create_uid")) {
            columns.add("create_uid");
            values.add(userId);
        }

        if (hasColumn("ptap_pic_rating", "write_uid")) {
            columns.add("write_uid");
            values.add(userId);
        }

        if (hasColumn("ptap_pic_rating", "create_date")) {
            columns.add("create_date");
            values.add(LocalDateTime.now().minusHours(7));
        }

        if (hasColumn("ptap_pic_rating", "write_date")) {
            columns.add("write_date");
            values.add(LocalDateTime.now().minusHours(7));
        }

        String placeholders = columns.stream()
                .map(col -> "?")
                .collect(java.util.stream.Collectors.joining(", "));

        String sql = "INSERT INTO ptap_pic_rating (" +
                String.join(", ", columns) +
                ") VALUES (" +
                placeholders +
                ")";

        jdbcTemplate.update(sql, values.toArray());
    }

    private Map<Long, RatingData> loadRatingsBulk(List<Long> ticketIds) {
        Map<Long, RatingData> result = new HashMap<>();

        if (ticketIds == null || ticketIds.isEmpty()) {
            return result;
        }

        try {
            if (!hasTable("ptap_pic_rating") || !hasColumn("ptap_pic_rating", "ticket_id")) {
                return result;
            }

            String placeholders = ticketIds.stream()
                    .map(id -> "?")
                    .collect(java.util.stream.Collectors.joining(","));

            String sql = """
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

            List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                    String.format(sql, placeholders),
                    ticketIds.toArray()
            );

            for (Map<String, Object> row : rows) {
                Long ticketId = toLong(getValueIgnoreCase(row, "ticket_id"));

                if (ticketId == null) continue;

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
                        "rating_score"
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

                LocalDateTime createDate = firstDateTimeIgnoreCase(row,
                        "create_date",
                        "write_date",
                        "created_at",
                        "date"
                );

                result.put(
                        ticketId,
                        new RatingData(
                                rating,
                                rating != null ? rating + " / 5" : "N/A",
                                comment != null ? comment : "-",
                                createDate
                        )
                );
            }

            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return result;
        }
    }

    private String firstExistingColumn(String tableName, String... columns) {
        for (String column : columns) {
            if (hasColumn(tableName, column)) {
                return column;
            }
        }

        return null;
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

    private Long toLong(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }

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

    private record RatingData(
            Integer rating,
            String ratingText,
            String comment,
            LocalDateTime createDate
    ) {
    }
}