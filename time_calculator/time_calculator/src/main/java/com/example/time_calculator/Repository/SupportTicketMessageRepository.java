package com.example.time_calculator.Repository;

import com.example.time_calculator.Entity.SupportTicketMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SupportTicketMessageRepository extends JpaRepository<SupportTicketMessage, Long> {

    List<SupportTicketMessage> findAllByTicketIdOrderByIdAsc(Long ticketId);

    List<SupportTicketMessage> findAllByTicketIdOrderByCreateDateAsc(Long ticketId);

    @Query("""
        SELECT m
        FROM SupportTicketMessage m
        JOIN SupportTicket t ON t.id = m.ticketId
        WHERE t.ticketNumber = :ticketNumber
        ORDER BY m.createDate ASC
    """)
    List<SupportTicketMessage> findByTicketNumber(@Param("ticketNumber") String ticketNumber);

    @Modifying
    @Query(
            value = """
                    UPDATE website_support_ticket_message
                    SET
                        content = COALESCE(:content, content),
                        create_date = COALESCE(:createDate, create_date),
                        response_time = COALESCE(:responseTime, response_time),
                        resolution_time = COALESCE(:resolutionTime, resolution_time),
                        write_date = NOW()
                    WHERE id = :id
                    """,
            nativeQuery = true
    )
    int updateMessageEditableFields(
            @Param("id") Long id,
            @Param("content") String content,
            @Param("createDate") LocalDateTime createDate,
            @Param("responseTime") Double responseTime,
            @Param("resolutionTime") Double resolutionTime
    );
}