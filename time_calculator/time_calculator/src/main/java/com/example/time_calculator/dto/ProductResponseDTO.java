package com.example.time_calculator.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for GET /api/products/my-products
 *
 * A product appears in this list if the customer's partner is:
 *   a) directly subscribed via res_partner.product_ids (M2M), OR
 *   b) has raised at least one support ticket for the product.
 *
 * No database migration required — all joins use existing columns.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponseDTO {

    /** product_template.id */
    private Long id;

    /** product_template.name */
    private String productName;

    /**
     * Human-readable reference code (e.g. "PRD-00042").
     * Derived from the numeric id. Replace with default_code if available.
     */
    private String productCode;

    /**
     * Subject of the most recent ticket this customer raised for this product.
     * NULL if the product was matched via direct M2M subscription only (no tickets yet).
     */
    private String latestTicketSubject;

    /**
     * Total tickets this customer has raised for this product.
     * 0 if the product was matched via direct M2M subscription with no tickets yet.
     */
    private Long ticketCount;

    /**
     * Earliest ticket creation date for this product from this customer.
     * NULL if no tickets exist yet.
     */
    private LocalDateTime firstTicketDate;

    /**
     * Most recent ticket write date for this product from this customer.
     * NULL if no tickets exist yet.
     */
    private LocalDateTime lastUpdated;
}
