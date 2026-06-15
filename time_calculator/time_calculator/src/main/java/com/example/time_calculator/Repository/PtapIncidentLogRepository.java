package com.example.time_calculator.Repository;

import com.example.time_calculator.Entity.PtapIncidentLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface PtapIncidentLogRepository
        extends JpaRepository<PtapIncidentLog, Integer> {

    Optional<PtapIncidentLog> findByTicket_Id(Long ticketId);

    @Query("""
    SELECT i
    FROM PtapIncidentLog i
    JOIN SupportTicket t
    ON t.id = i.ticket.id
    WHERE t.ticketNumber = :ticketNumber
    """)
    Optional<PtapIncidentLog> findByTicketNumber(String ticketNumber);

}