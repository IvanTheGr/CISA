package com.example.time_calculator.Repository;

import com.example.time_calculator.Entity.TicketPriority;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketPriorityRepository extends JpaRepository<TicketPriority, Long> {
}