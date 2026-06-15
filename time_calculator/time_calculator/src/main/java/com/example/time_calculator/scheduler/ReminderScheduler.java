package com.example.time_calculator.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.example.time_calculator.Service.ReminderService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReminderScheduler {

    private final ReminderService reminderService;

    /** Runs every day at 08:00 server time. */
    @Scheduled(cron = "0 0 8 * * *")
    public void scheduledReminders() {
        log.info("ReminderScheduler: running daily reminder check");
        reminderService.runReminders();
    }
}
