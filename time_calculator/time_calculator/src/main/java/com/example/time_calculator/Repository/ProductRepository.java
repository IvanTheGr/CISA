package com.example.time_calculator.Repository;

import com.example.time_calculator.Entity.ProductTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * ProductRepository — query confirmed against the actual ERD schema.
 *
 * ── ERD-confirmed relationship chain ────────────────────────────────────────
 * The ERD contains NO res_partner_product_template_rel join table.
 * The ONLY link between a customer (res_partner) and a product (product_template)
 * in the real schema goes through the support ticket:
 *
 *   res_users.partner_id  →  res_partner.id
 *                                  ↓
 *            website_support_ticket.partner_id   (FK: website_support_ticket_partner_id_fkey)
 *            website_support_ticket.product_id   (FK: website_support_ticket_product_id_fkey)
 *                                  ↓
 *                         product_template.id
 *
 * ERD FK entries that confirm these joins:
 *   website_support_ticket_partner_id_fkey  → res_partner      (pk-ref=7,  fk-ref=1)
 *   website_support_ticket_product_id_fkey  → product_template (pk-ref=9,  fk-ref=1)
 *   res_users_partner_id_fkey               → res_partner      (pk-ref=7,  fk-ref=4)
 */
public interface ProductRepository extends JpaRepository<ProductTemplate, Long> {

    /**
     * Returns distinct products with ticket statistics for the authenticated customer.
     *
     * ── How it works ─────────────────────────────────────────────────────────
     *   1. Find all tickets where partner_id matches the customer's partner
     *      (resolved from res_users.partner_id via a single correlated subquery).
     *   2. Filter to tickets that have a product_id set.
     *   3. JOIN to product_template to get the product name.
     *   4. GROUP BY product to aggregate: ticket count, earliest date,
     *      latest write_date, and most-recent ticket subject.
     *   5. Order by ticket count descending so most-active products come first.
     *
     * Column order (mapped in ProductService by array index):
     *   [0] id              BIGINT
     *   [1] name            TEXT
     *   [2] latestSubject   TEXT
     *   [3] ticketCount     BIGINT
     *   [4] firstTicketDate TIMESTAMP
     *   [5] lastUpdated     TIMESTAMP
     *
     * @param userId  res_users.id of the currently authenticated user
     */
    @Query(value = """
        SELECT
            pt.id                       AS id,
            pt.name                     AS name,
            MAX(wst.subject)            AS latestSubject,
            COUNT(wst.id)               AS ticketCount,
            MIN(wst.create_date_time)   AS firstTicketDate,
            MAX(wst.write_date)         AS lastUpdated
        FROM website_support_ticket wst
        INNER JOIN product_template pt
               ON  pt.id = wst.product_id
        WHERE wst.product_id IS NOT NULL
          AND wst.partner_id = (
                SELECT partner_id
                FROM   res_users
                WHERE  id = :userId
                  AND  active = TRUE
                LIMIT  1
              )
        GROUP BY pt.id, pt.name
        ORDER BY COUNT(wst.id) DESC, pt.name ASC
        """, nativeQuery = true)
    List<Object[]> findProductStatsForUser(@Param("userId") Long userId);
}