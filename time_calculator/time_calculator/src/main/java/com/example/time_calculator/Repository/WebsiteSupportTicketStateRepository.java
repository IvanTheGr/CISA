package com.example.time_calculator.Repository;

import com.example.time_calculator.Entity.WebsiteSupportTicketState;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WebsiteSupportTicketStateRepository
        extends JpaRepository<WebsiteSupportTicketState, Long> {

    Optional<WebsiteSupportTicketState> findByNameIgnoreCase(String name);
}
