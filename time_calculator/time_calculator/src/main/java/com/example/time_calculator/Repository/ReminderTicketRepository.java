package com.example.time_calculator.Repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.time_calculator.Entity.SupportTicket;

public interface ReminderTicketRepository extends JpaRepository<SupportTicket, Long> {

    /**
     * Customer-Product reminder: tickets that have a product attached,
     * are not closed, and whose plannedTime falls within the upcoming window.
     */
    @Query("""
        SELECT t
        FROM SupportTicket t
        LEFT JOIN FETCH t.partner
        LEFT JOIN FETCH t.product
        LEFT JOIN FETCH t.user u
        LEFT JOIN FETCH u.employees
        WHERE t.productId IS NOT NULL
          AND LOWER(COALESCE(t.stateName, '')) NOT LIKE '%closed%'
          AND t.plannedTime IS NOT NULL
          AND t.plannedTime BETWEEN :now AND :windowEnd
        ORDER BY t.plannedTime ASC
    """)
    List<SupportTicket> findDueCustomerProductTickets(
            @Param("now") LocalDateTime now,
            @Param("windowEnd") LocalDateTime windowEnd
    );

    /**
     * Returns the single nearest upcoming product ticket — used for test notification previews.
     * Pass PageRequest.of(0, 1) as pageable.
     */
    @Query("""
        SELECT t
        FROM SupportTicket t
        LEFT JOIN FETCH t.partner
        LEFT JOIN FETCH t.product
        WHERE t.productId IS NOT NULL
          AND LOWER(COALESCE(t.stateName, '')) NOT LIKE '%closed%'
          AND t.plannedTime IS NOT NULL
          AND t.plannedTime > :now
        ORDER BY t.plannedTime ASC
    """)
    List<SupportTicket> findNearestProductTickets(
            @Param("now") LocalDateTime now,
            Pageable pageable
    );

    /**
     * PM reminder: tickets whose ticketCategory contains "PM" or "Maintenance",
     * are not closed, and whose plannedTime falls within the upcoming window.
     */
    @Query("""
        SELECT t
        FROM SupportTicket t
        LEFT JOIN FETCH t.partner
        LEFT JOIN FETCH t.product
        LEFT JOIN FETCH t.user u
        LEFT JOIN FETCH u.employees
        WHERE LOWER(COALESCE(t.ticketCategory, '')) LIKE '%pm%'
           OR LOWER(COALESCE(t.ticketCategory, '')) LIKE '%maintenance%'
          AND LOWER(COALESCE(t.stateName, '')) NOT LIKE '%closed%'
          AND t.plannedTime IS NOT NULL
          AND t.plannedTime BETWEEN :now AND :windowEnd
        ORDER BY t.plannedTime ASC
    """)
    List<SupportTicket> findDuePmTickets(
            @Param("now") LocalDateTime now,
            @Param("windowEnd") LocalDateTime windowEnd
    );
}
