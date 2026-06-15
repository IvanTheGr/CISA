package com.example.time_calculator.Repository;

import com.example.time_calculator.Entity.ProductTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductTemplateRepository extends JpaRepository<ProductTemplate, Long> {

    /* STAFF search helper — top-20 name-contains */
    List<ProductTemplate> findTop20ByNameContainingIgnoreCase(String name);

    /**
     * NEW — returns ALL active products, no partner filter.
     * Used by privileged users (staff / managers) before a customer is selected
     * on the Create Ticket form.
     */
    @Query("""
        SELECT p
        FROM ProductTemplate p
        WHERE p.active = true
        ORDER BY p.name
    """)
    List<ProductTemplate> findAllActiveProducts();

    /**
     * CUSTOMER view — products linked to a specific partner via support tickets.
     * Raw SQL kept intentionally to allow LIMIT + GROUP BY in one shot.
     */
    @Query(value = """
        SELECT pt.*
        FROM product_template pt
        JOIN website_support_ticket wst
            ON wst.product_id = pt.id
        JOIN res_partner rp
            ON rp.id = wst.partner_id
        WHERE rp.id = :partnerId
        AND LOWER(pt.name) LIKE LOWER(CONCAT('%', :search, '%'))
        GROUP BY pt.id
        ORDER BY pt.name
        LIMIT 20
    """, nativeQuery = true)
    List<ProductTemplate> findProductsByCustomer(
            @Param("partnerId") Long partnerId,
            @Param("search") String search
    );

    /**
     * Products linked to a partner via ptap_web_support_sla (SLA subscriptions).
     *
     * IMPORTANT: this query is only valid when partnerId belongs to a CUSTOMER
     * partner that has SLA entries. DO NOT call this for internal/employee partners
     * — they will never have SLA rows and the result will always be empty.
     *
     * Call sites:
     *  - DropdownController: privileged user + explicit ?partnerId  (customer selected)
     *  - DropdownController: non-privileged user (own partner)
     */
    @Query("""
        SELECT DISTINCT p
        FROM ProductTemplate p
        JOIN PtapWebSupportSla s ON s.product.id = p.id
        WHERE s.partner.id = :partnerId
        ORDER BY p.name
    """)
    List<ProductTemplate> findProductsByPartner(
            @Param("partnerId") Long partnerId
    );
}
