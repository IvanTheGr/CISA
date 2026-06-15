package com.example.time_calculator.Service;

import com.example.time_calculator.Entity.ResUsers;
import com.example.time_calculator.Repository.ProductRepository;
import com.example.time_calculator.Repository.ResUsersRepository;
import com.example.time_calculator.dto.ProductResponseDTO;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * ProductService — fetches products linked to the authenticated customer.
 *
 * ── Fix summary ──────────────────────────────────────────────────────────────
 * The original service delegated all business logic to ProductRepository's query.
 * The bug was in the repository query (wrong join column: create_user_id instead
 * of the partner_id chain). This service itself needed no structural changes,
 * but the row mapping is hardened against nulls returned from the LEFT JOIN
 * on ticket_stats (products with no tickets now return ticketCount=0 correctly).
 *
 * ── Relationship used ────────────────────────────────────────────────────────
 *   res_users.id → res_users.partner_id → res_partner.id
 *     PATH 1: res_partner ←M2M→ product_template   (direct subscription)
 *     PATH 2: res_partner ← website_support_ticket.partner_id
 *                         → website_support_ticket.product_id → product_template
 */
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository  productRepository;
    private final ResUsersRepository usersRepository;

    /* ── Resolve login from SecurityContext ────────────────────────────────── */
    private String currentLogin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        return auth.getName();
    }

    /* ══════════════════════════════════════════════════════════
       GET /api/products/my-products
    ══════════════════════════════════════════════════════════ */

    /**
     * Returns all products linked to the authenticated customer.
     *
     * Products are included if:
     *   a) the customer's partner is directly subscribed (res_partner.product_ids M2M), OR
     *   b) the customer's partner has raised a support ticket for that product.
     *
     * Each product is enriched with ticket statistics. Products with no tickets
     * show ticketCount=0 and null dates (displayed as "—" in the UI).
     */
    public List<ProductResponseDTO> getProductsForCurrentUser() {

        String login = currentLogin();

        ResUsers user = usersRepository
                .findByLoginAndActiveTrue(login)
                .orElseThrow(() -> new RuntimeException("User not found: " + login));

        List<Object[]> rows = productRepository.findProductStatsForUser(user.getId());

        List<ProductResponseDTO> result = new ArrayList<>();

        for (Object[] row : rows) {
            /*
             * Column order from the native query (see ProductRepository):
             *   [0] id              (Long / BigInteger)
             *   [1] name            (String)
             *   [2] latestSubject   (String | null  — null if no tickets yet)
             *   [3] ticketCount     (Long — COALESCE ensures 0, never null)
             *   [4] firstTicketDate (Timestamp | null)
             *   [5] lastUpdated     (Timestamp | null)
             */
            Long id = row[0] != null
                    ? ((Number) row[0]).longValue()
                    : null;

            String name          = row[1] != null ? row[1].toString() : "—";
            String latestSubject = row[2] != null ? row[2].toString() : null;

            // COALESCE in SQL guarantees 0 for unmatched LEFT JOIN rows,
            // but we guard defensively here anyway.
            Long ticketCount = row[3] != null
                    ? ((Number) row[3]).longValue()
                    : 0L;

            LocalDateTime firstDate   = toLocalDateTime(row[4]);
            LocalDateTime lastUpdated = toLocalDateTime(row[5]);

            // Human-readable product reference code (e.g. PRD-00042).
            // Replace with a real 'default_code' column if your Odoo instance has it.
            String productCode = id != null
                    ? "PRD-" + String.format("%05d", id)
                    : "PRD-?????";

            result.add(ProductResponseDTO.builder()
                    .id(id)
                    .productName(name)
                    .productCode(productCode)
                    .latestTicketSubject(latestSubject)
                    .ticketCount(ticketCount)
                    .firstTicketDate(firstDate)
                    .lastUpdated(lastUpdated)
                    .build());
        }

        return result;
    }

    /* ── Helper: safely convert Timestamp or LocalDateTime → LocalDateTime ── */
    private LocalDateTime toLocalDateTime(Object value) {
        if (value == null)                          return null;
        if (value instanceof LocalDateTime ldt)     return ldt;
        if (value instanceof java.sql.Timestamp ts) return ts.toLocalDateTime();
        return null;
    }


}
