package com.example.time_calculator.Repository;

import com.example.time_calculator.Entity.WebsiteSupportTicketApproval;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WebsiteSupportTicketApprovalRepository
        extends JpaRepository<WebsiteSupportTicketApproval, Long> {

    Optional<WebsiteSupportTicketApproval> findByName(String name);

}
