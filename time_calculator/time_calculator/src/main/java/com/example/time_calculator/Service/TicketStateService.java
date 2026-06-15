package com.example.time_calculator.Service;

import com.example.time_calculator.Entity.WebsiteSupportTicketState;
import com.example.time_calculator.Repository.WebsiteSupportTicketStateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TicketStateService {

    private final WebsiteSupportTicketStateRepository repository;

    public WebsiteSupportTicketState getOpenState() {
        return repository
                .findByNameIgnoreCase("Open")
                .orElseThrow();
    }

    public WebsiteSupportTicketState getStateByName(String name) {
        return repository.findByNameIgnoreCase(name).orElse(null);
    }
}