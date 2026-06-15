package com.example.time_calculator.Controller;

import com.example.time_calculator.Service.ReminderConfigStore;
import com.example.time_calculator.Service.ReminderNotificationService;
import com.example.time_calculator.Service.ReminderService;
import com.example.time_calculator.dto.ReminderConfigDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reminder")
@RequiredArgsConstructor
public class ReminderController {

    private final ReminderConfigStore        configStore;
    private final ReminderService            reminderService;
    private final ReminderNotificationService notificationService;

    /** GET /api/reminder/config — return all reminder configs */
    @GetMapping("/config")
    public ResponseEntity<List<ReminderConfigDto>> getAll() {
        return ResponseEntity.ok(configStore.getAll());
    }

    /** GET /api/reminder/config/{id} — return one config */
    @GetMapping("/config/{id}")
    public ResponseEntity<ReminderConfigDto> getOne(@PathVariable String id) {
        ReminderConfigDto dto = configStore.get(id);
        if (dto == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(dto);
    }

    /** POST /api/reminder/config — save / update a reminder config */
    @PostMapping("/config")
    public ResponseEntity<ReminderConfigDto> save(@RequestBody ReminderConfigDto dto) {
        if (dto.getId() == null || dto.getId().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        configStore.save(dto);
        return ResponseEntity.ok(dto);
    }

    /** POST /api/reminder/trigger — manually run all enabled reminders */
    @PostMapping("/trigger")
    public ResponseEntity<String> triggerAll() {
        reminderService.runReminders();
        return ResponseEntity.ok("Reminders triggered");
    }

    /** POST /api/reminder/trigger/{id} — manually run one reminder type */
    @PostMapping("/trigger/{id}")
    public ResponseEntity<String> triggerOne(@PathVariable String id) {
        reminderService.runForReminder(id);
        return ResponseEntity.ok("Reminder [" + id + "] triggered");
    }

    /**
     * POST /api/reminder/test
     * Body: { "channel": "email"|"telegram"|"whatsapp", "config": { ...fields } }
     * Sends a real test message using the supplied credentials.
     * Returns 200 on success or 400 with an error message on failure.
     */
    @PostMapping("/test")
    public ResponseEntity<String> testChannel(@RequestBody Map<String, Object> body) {
        String channel    = (String) body.get("channel");
        String reminderId = (String) body.get("reminderId");
        @SuppressWarnings("unchecked")
        Map<String, String> config = (Map<String, String>) body.get("config");

        if (channel == null || channel.isBlank()) {
            return ResponseEntity.badRequest().body("Missing 'channel' field");
        }

        try {
            notificationService.testChannel(channel, config, reminderId);
            return ResponseEntity.ok("Test message sent successfully via " + channel);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            String msg = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            return ResponseEntity.badRequest().body("Connection failed: " + msg);
        }
    }
}
