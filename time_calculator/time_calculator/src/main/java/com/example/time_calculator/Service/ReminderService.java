package com.example.time_calculator.Service;

import com.example.time_calculator.Entity.HrEmployee;
import com.example.time_calculator.Entity.SupportTicket;
import com.example.time_calculator.Repository.HrEmployeeRepository;
import com.example.time_calculator.Repository.ReminderTicketRepository;
import com.example.time_calculator.Repository.ResPartnerRepository;
import com.example.time_calculator.dto.ReminderConfigDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReminderService {

    private final ReminderConfigStore         configStore;
    private final ReminderTicketRepository    ticketRepo;
    private final HrEmployeeRepository        employeeRepo;
    private final ResPartnerRepository        partnerRepo;
    private final ReminderNotificationService notificationService;

    /**
     * lastSentMap tracks when a reminder was last dispatched for a specific ticket.
     * Key: "{ticketId}-{reminderId}"  →  Value: timestamp of last send.
     * This prevents re-sending within the repeatEveryDays window.
     */
    private final Map<String, LocalDateTime> lastSentMap = new ConcurrentHashMap<>();

    /** Called by the scheduler every morning, or manually via the API. */
    public void runReminders() {
        runForReminder("customerProduct");
        runForReminder("pm");
    }

    public void runForReminder(String reminderId) {
        ReminderConfigDto config = configStore.get(reminderId);
        if (config == null || !config.isEnabled()) return;

        LocalDateTime now       = LocalDateTime.now();
        LocalDateTime windowEnd = now.plusDays(config.getStartDaysBefore());

        List<SupportTicket> tickets = "pm".equals(reminderId)
                ? ticketRepo.findDuePmTickets(now, windowEnd)
                : ticketRepo.findDueCustomerProductTickets(now, windowEnd);

        for (SupportTicket ticket : tickets) {
            String key = ticket.getId() + "-" + reminderId;
            LocalDateTime lastSent = lastSentMap.get(key);

            // Skip if already sent within the repeat window
            if (lastSent != null && lastSent.plusDays(config.getRepeatEveryDays()).isAfter(now)) {
                continue;
            }

            // Skip if we have been reminding longer than keepRemindingDays
            if (ticket.getPlannedTime() != null) {
                LocalDateTime keepUntil = ticket.getPlannedTime().plusDays(config.getKeepRemindingDays());
                if (now.isAfter(keepUntil)) continue;
            }

            List<String> recipients = resolveRecipientEmails(ticket, config);
            List<String> phones     = resolveRecipientPhones(ticket, config);

            if (recipients.isEmpty() && phones.isEmpty()) {
                log.warn("Reminder [{}] ticket #{}: no recipients resolved, skipping", reminderId, ticket.getId());
                continue;
            }

            String subject = buildSubject(reminderId, ticket);
            String body    = buildBody(reminderId, ticket);

            notificationService.send(config, recipients, phones, subject, body);
            lastSentMap.put(key, now);

            log.info("Reminder [{}] sent for ticket #{} to {} recipient(s)", reminderId, ticket.getId(), recipients.size());
        }
    }

    // ── Recipient resolution ────────────────────────────────────────────────

    private List<String> resolveRecipientEmails(SupportTicket ticket, ReminderConfigDto config) {
        List<String> emails = new ArrayList<>();

        for (String pic : config.getAssignTo()) {
            switch (pic) {
                case "l1"       -> resolveEmail(ticket.getUserId()).ifPresent(emails::add);
                case "l2"       -> resolveEmail(ticket.getL2UserId()).ifPresent(emails::add);
                case "sales"    -> resolveSalesEmail(ticket).ifPresent(emails::add);
                case "customer" -> resolveCustomerEmail(ticket).ifPresent(emails::add);
            }
        }

        return emails.stream().distinct().collect(Collectors.toList());
    }

    private List<String> resolveRecipientPhones(SupportTicket ticket, ReminderConfigDto config) {
        List<String> phones = new ArrayList<>();

        for (String pic : config.getAssignTo()) {
            switch (pic) {
                case "l1"       -> resolvePhone(ticket.getUserId()).ifPresent(phones::add);
                case "l2"       -> resolvePhone(ticket.getL2UserId()).ifPresent(phones::add);
                case "customer" -> resolveCustomerPhone(ticket).ifPresent(phones::add);
            }
        }

        return phones.stream().distinct().collect(Collectors.toList());
    }

    private Optional<String> resolveEmail(Long userId) {
        if (userId == null || userId == 0) return Optional.empty();
        return employeeRepo.findEmailByUserId(userId);
    }

    private Optional<String> resolvePhone(Long userId) {
        if (userId == null || userId == 0) return Optional.empty();
        return employeeRepo.findMobileByUserId(userId);
    }

    private Optional<String> resolveCustomerEmail(SupportTicket ticket) {
        if (ticket.getPartner() != null) {
            String email = ticket.getPartner().getEmail();
            if (email != null && !email.isBlank()) return Optional.of(email.trim());
        }
        if (ticket.getEmail() != null && !ticket.getEmail().isBlank())
            return Optional.of(ticket.getEmail().trim());
        return Optional.empty();
    }

    private Optional<String> resolveCustomerPhone(SupportTicket ticket) {
        if (ticket.getPartner() != null) {
            String mobile = ticket.getPartner().getMobile();
            if (mobile != null && !mobile.isBlank()) return Optional.of(mobile.trim());
            String phone = ticket.getPartner().getPhone();
            if (phone != null && !phone.isBlank()) return Optional.of(phone.trim());
        }
        return Optional.empty();
    }

    private Optional<String> resolveSalesEmail(SupportTicket ticket) {
        if (ticket.getPartnerId() == null) return Optional.empty();
        return partnerRepo.findById(ticket.getPartnerId())
                .map(p -> p.getSalesperson())
                .filter(Objects::nonNull)
                .map(u -> {
                    Optional<HrEmployee> emp = employeeRepo.findByUserId(u.getId());
                    return emp.map(HrEmployee::getWorkEmail).orElse(null);
                });
    }

    // ── Message builders ────────────────────────────────────────────────────

    private String buildSubject(String reminderId, SupportTicket ticket) {
        String type = "pm".equals(reminderId) ? "Preventive Maintenance" : "Customer Product";
        String product = ticket.getProduct() != null ? ticket.getProduct().getName() : null;
        String base = "[CISA Reminder] " + type + " – Ticket #" + ticket.getTicketNumber();
        return product != null ? base + " | " + product : base;
    }

    private String buildBody(String reminderId, SupportTicket ticket) {
        String product = ticket.getProduct()  != null ? ticket.getProduct().getName()        : "N/A";
        String partner = ticket.getPartner()  != null ? ticket.getPartner().getDisplayName() : "N/A";
        String subject = ticket.getSubject()  != null ? ticket.getSubject()                  : "N/A";
        String planned = ticket.getPlannedTime() != null
                ? ticket.getPlannedTime().toLocalDate().toString()
                : "N/A";

        long daysLeft = ticket.getPlannedTime() != null
                ? ChronoUnit.DAYS.between(LocalDateTime.now(), ticket.getPlannedTime())
                : -1;
        String daysLabel = daysLeft > 0
                ? daysLeft + " day" + (daysLeft == 1 ? "" : "s") + " remaining"
                : daysLeft == 0 ? "today" : "deadline has passed";

        if ("pm".equals(reminderId)) {
            return """
                    This is an automated reminder from CISA.

                    Type           : Preventive Maintenance
                    Ticket         : #%s
                    Subject        : %s
                    Customer       : %s
                    Product        : %s
                    Scheduled Date : %s (%s)

                    Please prepare and take action before the scheduled date.
                    """.formatted(ticket.getTicketNumber(), subject, partner, product, planned, daysLabel);
        }

        return """
                This is an automated reminder from CISA.

                Type           : Customer Product
                Ticket         : #%s
                Customer       : %s
                Product        : %s
                Deadline       : %s (%s)
                Subject        : %s

                The above product subscription is approaching its deadline.
                Please follow up with the customer regarding renewal (perpanjang) or closure.
                """.formatted(ticket.getTicketNumber(), partner, product, planned, daysLabel, subject);
    }
}
