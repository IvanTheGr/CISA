package com.example.time_calculator.Repository;

import com.example.time_calculator.Entity.SupportTicket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Modifying;
import java.time.LocalDateTime;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {

    @EntityGraph(attributePaths = {
            "partner",
            "partner.parent",
            "product",
            "priority",
            "user",
            "user.partner"
    })
    Page<SupportTicket> findAll(Pageable pageable);

    long countByCreateDateTimeBetween(LocalDateTime start, LocalDateTime end);

    boolean existsByPortalAccessKey(String key);

    Optional<SupportTicket> findByTicketNumber(String ticketNumber);

    @EntityGraph(attributePaths = {
            "partner",
            "partner.parent",
            "product",
            "priority",
            "user",
            "user.partner"
    })
    Optional<SupportTicket> findById(Long id);

    @Query("""
        SELECT COUNT(t)
        FROM SupportTicket t
        WHERE t.stateName = 'Open'
    """)
    Long countOpenTickets();

    @Query("""
        SELECT COUNT(t)
        FROM SupportTicket t
        WHERE t.stateName LIKE '%Closed%'
    """)
    Long countClosedTickets();

    @Query("""
        SELECT COUNT(t)
        FROM SupportTicket t
        WHERE t.stateName = 'Open'
          AND t.userId = :userId
    """)
    Long countMyOpenTickets(Long userId);

    @Query("""
        SELECT COUNT(t)
        FROM SupportTicket t
        WHERE t.stateName = 'Open'
          AND t.userId IS NULL
    """)
    Long countUnassignedOpenTickets();

    @Query("""
        SELECT COUNT(t)
        FROM SupportTicket t
        WHERE t.partnerId = :partnerId
    """)
    Long countTicketsByPartnerId(Long partnerId);

    @Query("""
        SELECT COUNT(t)
        FROM SupportTicket t
        WHERE t.partnerId = :partnerId
          AND t.stateName = 'Open'
    """)
    Long countOpenTicketsByPartnerId(Long partnerId);

    @Query("""
        SELECT COUNT(t)
        FROM SupportTicket t
        WHERE t.partnerId = :partnerId
          AND t.stateName LIKE '%Closed%'
    """)
    Long countClosedTicketsByPartnerId(Long partnerId);

    @Query("""
        SELECT COUNT(t)
        FROM SupportTicket t
        WHERE t.partnerId = :partnerId
           OR t.parentCompanyId = :companyId
    """)
    Long countTicketsByCustomerScope(
            @Param("partnerId") Long partnerId,
            @Param("companyId") Long companyId
    );

    @Query("""
        SELECT COUNT(t)
        FROM SupportTicket t
        WHERE (t.partnerId = :partnerId OR t.parentCompanyId = :companyId)
          AND t.stateName = 'Open'
    """)
    Long countOpenTicketsByCustomerScope(
            @Param("partnerId") Long partnerId,
            @Param("companyId") Long companyId
    );

    @Query("""
        SELECT COUNT(t)
        FROM SupportTicket t
        WHERE (t.partnerId = :partnerId OR t.parentCompanyId = :companyId)
          AND t.stateName LIKE '%Closed%'
    """)
    Long countClosedTicketsByCustomerScope(
            @Param("partnerId") Long partnerId,
            @Param("companyId") Long companyId
    );

    @Query("""
        SELECT t
        FROM SupportTicket t
        LEFT JOIN FETCH t.partner p
        LEFT JOIN FETCH p.parent
        LEFT JOIN FETCH t.product
        LEFT JOIN FETCH t.priority
        LEFT JOIN FETCH t.user u
        LEFT JOIN FETCH u.partner
        WHERE (t.partnerId = :partnerId OR t.parentCompanyId = :companyId)
        ORDER BY COALESCE(t.createDateTime, t.createDate) DESC
    """)
    List<SupportTicket> findMyTicketsForCustomerScope(
            @Param("partnerId") Long partnerId,
            @Param("companyId") Long companyId
    );

    @Query("""
        SELECT t
        FROM SupportTicket t
        LEFT JOIN FETCH t.partner p
        LEFT JOIN FETCH p.parent
        LEFT JOIN FETCH t.product
        LEFT JOIN FETCH t.priority
        LEFT JOIN FETCH t.user u
        LEFT JOIN FETCH u.partner
        WHERE (
            t.partnerId = :partnerId
            OR t.parentCompanyId = :companyId
        )
        AND t.stateName NOT LIKE '%Closed%'
        ORDER BY t.createDate DESC
    """)
    List<SupportTicket> findMyOpenTickets(
            @Param("partnerId") Long partnerId,
            @Param("companyId") Long companyId
    );

    @Query("""
        SELECT t
        FROM SupportTicket t
        LEFT JOIN FETCH t.partner p
        LEFT JOIN FETCH p.parent
        LEFT JOIN FETCH t.product
        LEFT JOIN FETCH t.priority
        LEFT JOIN FETCH t.user u
        LEFT JOIN FETCH u.partner
        WHERE t.stateName NOT LIKE '%Closed%'
        ORDER BY t.parentCompanyId ASC, t.createDate DESC
    """)
    List<SupportTicket> findAllOpenTicketsForGroupedView();

    @Query(
            value = """
                SELECT *
                FROM website_support_ticket t
                WHERE COALESCE(LOWER(t.state_name), '') NOT LIKE '%closed%'
                  AND t.user_id = :userId
                ORDER BY COALESCE(t.create_date_time, t.create_date) DESC
                """,
            nativeQuery = true
    )
    List<SupportTicket> findOpenTicketsAssignedToUserForGroupedView(@Param("userId") Long userId);

    @Query(
            value = """
                SELECT *
                FROM website_support_ticket t
                WHERE COALESCE(LOWER(t.state_name), '') NOT LIKE '%closed%'
                  AND (
                        t.user_id = :userId
                        OR t.user_id IS NULL
                        OR t.user_id = 0
                  )
                ORDER BY COALESCE(t.create_date_time, t.create_date) DESC
                """,
            nativeQuery = true
    )
    List<SupportTicket> findOpenTicketsAssignedToUserOrUnassignedForGroupedView(@Param("userId") Long userId);
    @Query(
            value = """
                SELECT *
                FROM website_support_ticket t
                WHERE (:keyword IS NULL OR :keyword = ''
                       OR LOWER(t.ticket_number) LIKE LOWER(CONCAT('%', :keyword, '%'))
                       OR LOWER(t.subject) LIKE LOWER(CONCAT('%', :keyword, '%')))
                ORDER BY t.id DESC
                LIMIT 100
                """,
            nativeQuery = true
    )
    List<SupportTicket> searchTicketDropdown(@Param("keyword") String keyword);
    @Modifying
    @Query(
            value = """
                UPDATE website_support_ticket
                SET
                    create_date_time = COALESCE(:createDateTime, create_date_time),

                    create_date = CASE
                        WHEN :createDateTime IS NOT NULL
                            THEN (:createDateTime - INTERVAL '7 hours')
                        ELSE create_date
                    END,

                    start_resolution_time = COALESCE(:startResolutionTime, start_resolution_time),

                    start_resolution_time_no_gmt = CASE
                        WHEN :startResolutionTime IS NOT NULL
                            THEN (:startResolutionTime - INTERVAL '7 hours')
                        ELSE start_resolution_time_no_gmt
                    END,

                    end_resolution_time = COALESCE(:endResolutionTime, end_resolution_time),

                    end_resolution_time_no_gmt = CASE
                        WHEN :endResolutionTime IS NOT NULL
                            THEN (:endResolutionTime - INTERVAL '7 hours')
                        ELSE end_resolution_time_no_gmt
                    END,

                    close_time = CASE
                        WHEN :endResolutionTime IS NOT NULL
                            THEN (:endResolutionTime - INTERVAL '7 hours')
                        ELSE close_time
                    END,

                    close_date = CASE
                        WHEN :endResolutionTime IS NOT NULL
                            THEN DATE(:endResolutionTime - INTERVAL '7 hours')
                        ELSE close_date
                    END,

                    response_to_close = CASE
                        WHEN
                            (
                                CASE
                                    WHEN :createDateTime IS NOT NULL
                                        THEN (:createDateTime - INTERVAL '7 hours')
                                    ELSE create_date
                                END
                            ) IS NOT NULL
                            AND
                            (
                                CASE
                                    WHEN :endResolutionTime IS NOT NULL
                                        THEN (:endResolutionTime - INTERVAL '7 hours')
                                    ELSE close_time
                                END
                            ) IS NOT NULL
                        THEN EXTRACT(EPOCH FROM (
                            (
                                CASE
                                    WHEN :endResolutionTime IS NOT NULL
                                        THEN (:endResolutionTime - INTERVAL '7 hours')
                                    ELSE close_time
                                END
                            )
                            -
                            (
                                CASE
                                    WHEN :createDateTime IS NOT NULL
                                        THEN (:createDateTime - INTERVAL '7 hours')
                                    ELSE create_date
                                END
                            )
                        )) / 3600.0
                        ELSE response_to_close
                    END,

                    write_date = NOW()

                WHERE id = :id
                """,
            nativeQuery = true
    )
    int updateTicketTimestampsOnly(
            @Param("id") Long id,
            @Param("createDateTime") LocalDateTime createDateTime,
            @Param("startResolutionTime") LocalDateTime startResolutionTime,
            @Param("endResolutionTime") LocalDateTime endResolutionTime
    );
}