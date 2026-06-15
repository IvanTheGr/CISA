package com.example.time_calculator.Service;

import com.example.time_calculator.Entity.SupportTicket;
import com.example.time_calculator.Repository.ReminderTicketRepository;
import com.example.time_calculator.dto.ReminderConfigDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReminderNotificationService {

    private final RestTemplate            restTemplate;
    private final ReminderTicketRepository ticketRepo;

    public void send(ReminderConfigDto config,
                     List<String> emails,
                     List<String> phones,
                     String subject,
                     String body) {

        List<String> channels = config.getChannels();
        if (channels == null || channels.isEmpty()) return;

        Map<String, Map<String, String>> cfgs = config.getChannelConfigs();

        if (channels.contains("inApp")) {
            sendInApp(subject, body, emails);
        }

        if (channels.contains("email")) {
            Map<String, String> emailCfg = cfgs != null ? cfgs.get("email") : null;
            sendEmail(emailCfg, emails, subject, body);
        }

        if (channels.contains("telegram")) {
            Map<String, String> telegramCfg = cfgs != null ? cfgs.get("telegram") : null;
            sendTelegram(telegramCfg, body);
        }

        if (channels.contains("whatsapp")) {
            Map<String, String> waCfg = cfgs != null ? cfgs.get("whatsapp") : null;
            sendWhatsApp(waCfg, phones, body);
        }
    }

    // ── In-App ──────────────────────────────────────────────────────────────

    private void sendInApp(String subject, String body, List<String> recipients) {
        log.info("[IN-APP] {} → {}: {}", subject, recipients, body);
    }

    // ── Email ───────────────────────────────────────────────────────────────

    private void sendEmail(Map<String, String> cfg, List<String> to, String subject, String body) {
        if (cfg == null || to == null || to.isEmpty()) {
            log.warn("[EMAIL] Missing config or recipients, skipping");
            return;
        }
        try {
            doSendEmail(cfg, to, subject, body);
            log.info("[EMAIL] Sent to {}", to);
        } catch (Exception e) {
            log.error("[EMAIL] Failed to send: {}", e.getMessage(), e);
        }
    }

    private void doSendEmail(Map<String, String> cfg, List<String> to, String subject, String body) {
        JavaMailSenderImpl sender = buildMailSender(cfg);
        SimpleMailMessage msg = new SimpleMailMessage();

        // Fix: if fromName is blank, use the bare email address — a blank display-name
        // produces a malformed From header that Gmail rejects.
        String fromName  = cfg.getOrDefault("fromName", "").trim();
        String fromEmail = cfg.getOrDefault("smtpUser", "");
        msg.setFrom(fromName.isEmpty() ? fromEmail : fromName + " <" + fromEmail + ">");

        msg.setTo(to.toArray(String[]::new));
        msg.setSubject(subject);
        msg.setText(body);
        sender.send(msg);
    }

    private JavaMailSenderImpl buildMailSender(Map<String, String> cfg) {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();

        String host    = cfg.getOrDefault("smtpHost", "smtp.gmail.com").trim();
        String portStr = cfg.getOrDefault("smtpPort", "587").trim();
        // Fix: strip spaces from App Password — Gmail displays them grouped (e.g. "onyd xhrn mdbu pqba")
        // but the actual password used for authentication must have no spaces.
        String password = cfg.getOrDefault("smtpPass", "").replaceAll("\\s+", "");

        sender.setHost(host);
        sender.setPort(portStr.isBlank() ? 587 : Integer.parseInt(portStr));
        sender.setUsername(cfg.getOrDefault("smtpUser", "").trim());
        sender.setPassword(password);

        Properties props = sender.getJavaMailProperties();
        props.put("mail.transport.protocol",    "smtp");
        props.put("mail.smtp.auth",             "true");
        props.put("mail.smtp.starttls.enable",  "true");
        props.put("mail.smtp.starttls.required","true");
        // Fix: explicitly trust the SMTP host — required for Gmail's TLS certificate chain
        props.put("mail.smtp.ssl.trust",        host);
        // Fix: add timeouts so connection failures surface as errors instead of hanging
        props.put("mail.smtp.connectiontimeout","10000");
        props.put("mail.smtp.timeout",          "10000");
        props.put("mail.smtp.writetimeout",     "10000");
        return sender;
    }

    // ── Telegram ─────────────────────────────────────────────────────────────

    private void sendTelegram(Map<String, String> cfg, String body) {
        if (cfg == null) { log.warn("[TELEGRAM] Missing config, skipping"); return; }
        String botToken = cfg.get("botToken");
        String chatId   = cfg.get("chatId");
        if (botToken == null || chatId == null) {
            log.warn("[TELEGRAM] botToken or chatId is null, skipping");
            return;
        }
        try {
            doSendTelegram(botToken, chatId, body);
            log.info("[TELEGRAM] Sent to chat {}", chatId);
        } catch (Exception e) {
            log.error("[TELEGRAM] Failed to send: {}", e.getMessage(), e);
        }
    }

    private void doSendTelegram(String botToken, String chatId, String text) {
        String url = "https://api.telegram.org/bot" + botToken + "/sendMessage";
        Map<String, String> payload = new HashMap<>();
        payload.put("chat_id", chatId);
        payload.put("text",    text);
        restTemplate.postForObject(url, payload, String.class);
    }

    // ── WhatsApp ──────────────────────────────────────────────────────────────

    private void sendWhatsApp(Map<String, String> cfg, List<String> phones, String body) {
        if (cfg == null || phones == null || phones.isEmpty()) {
            log.warn("[WHATSAPP] Missing config or phone numbers, skipping");
            return;
        }
        String apiUrl = cfg.get("apiUrl");
        String apiKey = cfg.get("apiKey");
        if (apiUrl == null || apiKey == null) {
            log.warn("[WHATSAPP] apiUrl or apiKey is null, skipping");
            return;
        }
        for (String phone : phones) {
            try {
                doSendWhatsApp(apiUrl, apiKey, phone, body);
                log.info("[WHATSAPP] Sent to {}", phone);
            } catch (Exception e) {
                log.error("[WHATSAPP] Failed to send to {}: {}", phone, e.getMessage(), e);
            }
        }
    }

    private void doSendWhatsApp(String apiUrl, String apiKey, String phone, String message) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, String> payload = new HashMap<>();
        payload.put("target",  phone);
        payload.put("message", message);

        restTemplate.postForObject(apiUrl, new HttpEntity<>(payload, headers), String.class);
    }

    // ── Test (throws on failure so controller can return error response) ──────

    public void testChannel(String channel, Map<String, String> cfg, String reminderId) throws Exception {
        if (cfg == null) throw new IllegalArgumentException("No configuration provided");

        boolean isPm = "pm".equals(reminderId);

        String previewSubject;
        String previewBody;
        try {
            previewSubject = buildPreviewSubject(isPm);
            previewBody    = buildPreviewBody(isPm);
        } catch (Exception ex) {
            log.warn("[TEST] Could not build preview from DB ({}), using static sample", ex.getMessage());
            previewSubject = isPm
                    ? "[CISA TEST] Preventive Maintenance Reminder — Sample"
                    : "[CISA TEST] Product Reminder — Sample Notification";
            previewBody = isPm ? """
                    [TEST] This is a sample reminder preview (no live PM ticket data available).

                    Type           : Preventive Maintenance
                    Ticket         : #TKT-SAMPLE
                    Subject        : Scheduled Maintenance Q4
                    Customer       : PT. Sample Client
                    Product        : Core Banking System
                    Scheduled Date : 2025-12-31 (14 days remaining)

                    Please prepare and take action before the scheduled date.

                    -- Channel configuration verified successfully.
                    """ : """
                    [TEST] This is a sample reminder preview (no live ticket data available).

                    Type           : Customer Product
                    Ticket         : #TKT-SAMPLE
                    Customer       : PT. Sample Client
                    Product        : Enterprise License
                    Deadline       : 2025-12-31 (14 days remaining)
                    Subject        : Annual subscription renewal

                    The above product subscription is approaching its deadline.
                    Please follow up with the customer regarding renewal or closure.

                    -- Channel configuration verified successfully.
                    """;
        }

        switch (channel) {
            case "email" -> {
                String host = cfg.get("smtpHost"), port = cfg.get("smtpPort"),
                       user = cfg.get("smtpUser"), pass = cfg.get("smtpPass");
                if (host == null || host.isBlank()) throw new IllegalArgumentException("SMTP Host is required");
                if (port == null || port.isBlank()) throw new IllegalArgumentException("SMTP Port is required");
                if (user == null || user.isBlank()) throw new IllegalArgumentException("Username is required (full address, e.g. you@gmail.com)");
                if (pass == null || pass.isBlank()) throw new IllegalArgumentException("App Password is required");
                if (!user.contains("@"))            throw new IllegalArgumentException("Username must be a full email address (e.g. you@gmail.com)");
                try {
                    doSendEmail(cfg, List.of(user), previewSubject, previewBody);
                } catch (Exception e) {
                    throw new Exception(translateEmailError(e));
                }
            }
            case "telegram" -> {
                String botToken = cfg.get("botToken"), chatId = cfg.get("chatId");
                if (botToken == null || botToken.isBlank()) throw new IllegalArgumentException("Bot Token is required");
                if (chatId   == null || chatId.isBlank())   throw new IllegalArgumentException("Chat ID is required");
                try {
                    doSendTelegram(botToken, chatId, previewBody);
                } catch (Exception e) {
                    throw new Exception(translateTelegramError(e));
                }
            }
            case "whatsapp" -> {
                String apiUrl = cfg.get("apiUrl"), apiKey = cfg.get("apiKey"), phone = cfg.get("phone");
                if (apiUrl == null || apiUrl.isBlank()) throw new IllegalArgumentException("API URL is required");
                if (apiKey == null || apiKey.isBlank()) throw new IllegalArgumentException("API Key is required");
                if (phone  == null || phone.isBlank())  throw new IllegalArgumentException("Sender Phone is required");
                try {
                    doSendWhatsApp(apiUrl, apiKey, phone, previewBody);
                } catch (Exception e) {
                    throw new Exception(translateWhatsAppError(e));
                }
            }
            default -> throw new IllegalArgumentException("Unknown channel: " + channel);
        }
    }

    private String buildPreviewSubject(boolean isPm) {
        List<SupportTicket> nearest = ticketRepo.findNearestProductTickets(
                LocalDateTime.now(), PageRequest.of(0, 1));
        if (nearest.isEmpty()) {
            return isPm
                    ? "[CISA TEST] Preventive Maintenance Reminder — No upcoming PM tickets found"
                    : "[CISA TEST] Product Reminder — No upcoming product tickets found";
        }
        SupportTicket t   = nearest.get(0);
        String product    = t.getProduct() != null ? t.getProduct().getName() : "Product";
        String typeLabel  = isPm ? "Preventive Maintenance" : "Product";
        return "[CISA TEST] " + typeLabel + " Reminder — " + product;
    }

    private String buildPreviewBody(boolean isPm) {
        List<SupportTicket> nearest = ticketRepo.findNearestProductTickets(
                LocalDateTime.now(), PageRequest.of(0, 1));

        if (nearest.isEmpty()) {
            return isPm ? """
                    [TEST] No upcoming PM tickets found in the database.

                    Type           : Preventive Maintenance
                    Ticket         : #TKT-SAMPLE
                    Subject        : Scheduled Maintenance Q4
                    Customer       : PT. Sample Client
                    Product        : Core Banking System
                    Scheduled Date : (date) (14 days remaining)

                    Please prepare and take action before the scheduled date.

                    -- Channel configuration verified successfully.
                    """ : """
                    [TEST] No upcoming product tickets found in the database.

                    Type           : Customer Product
                    Ticket         : #TKT-SAMPLE
                    Customer       : PT. Sample Client
                    Product        : Enterprise License
                    Deadline       : (date) (14 days remaining)
                    Subject        : Annual subscription renewal

                    The above product subscription is approaching its deadline.
                    Please follow up with the customer regarding renewal (perpanjang) or closure.

                    -- Channel configuration verified successfully.
                    """;
        }

        SupportTicket t  = nearest.get(0);
        String product   = t.getProduct()    != null ? t.getProduct().getName()        : "N/A";
        String partner   = t.getPartner()    != null ? t.getPartner().getDisplayName() : "N/A";
        String subject   = t.getSubject()    != null ? t.getSubject()                  : "N/A";
        String planned   = t.getPlannedTime() != null
                ? t.getPlannedTime().toLocalDate().toString() : "N/A";
        long   daysLeft  = t.getPlannedTime() != null
                ? ChronoUnit.DAYS.between(LocalDateTime.now(), t.getPlannedTime()) : -1;
        String daysLabel = daysLeft > 0
                ? daysLeft + " day" + (daysLeft == 1 ? "" : "s") + " remaining"
                : daysLeft == 0 ? "today" : "deadline has passed";

        if (isPm) {
            return """
                    [TEST] This is a preview of the actual reminder that will be sent.

                    Type           : Preventive Maintenance
                    Ticket         : #%s
                    Subject        : %s
                    Customer       : %s
                    Product        : %s
                    Scheduled Date : %s (%s)

                    Please prepare and take action before the scheduled date.

                    -- Channel configuration verified successfully.
                    """.formatted(t.getTicketNumber(), subject, partner, product, planned, daysLabel);
        }

        return """
                [TEST] This is a preview of the actual reminder that will be sent.

                Type           : Customer Product
                Ticket         : #%s
                Customer       : %s
                Product        : %s
                Deadline       : %s (%s)
                Subject        : %s

                The above product subscription is approaching its deadline.
                Please follow up with the customer regarding renewal (perpanjang) or closure.

                -- Channel configuration verified successfully.
                """.formatted(t.getTicketNumber(), partner, product, planned, daysLabel, subject);
    }

    // ── Error translators — turn raw Java/SMTP exceptions into readable messages ─

    private String translateEmailError(Exception e) {
        String msg = e.getMessage() != null ? e.getMessage().toLowerCase() : "";
        if (msg.contains("535") || msg.contains("authentication failed") || msg.contains("username and password not accepted"))
            return "Gmail rejected the login. Make sure: (1) 2-Step Verification is ON in your Google account, (2) you used an App Password — not your regular Gmail password, (3) the username is your full Gmail address.";
        if (msg.contains("534") || msg.contains("application-specific password required"))
            return "Gmail requires an App Password. Go to Google Account → Security → 2-Step Verification → App Passwords and create one.";
        if (msg.contains("connection refused") || msg.contains("connect timed out") || msg.contains("connection timed out"))
            return "Could not connect to " + "smtp.gmail.com:587. The SMTP port (587) may be blocked by your server or network firewall. Ask your network admin to open outbound port 587.";
        if (msg.contains("unknown host") || msg.contains("nodename nor servname"))
            return "SMTP host not found. Double-check the host name (should be smtp.gmail.com).";
        if (msg.contains("ssl") || msg.contains("tls") || msg.contains("handshake"))
            return "TLS/SSL handshake failed. Check that port 587 is correct for STARTTLS.";
        return "Email send failed: " + e.getMessage();
    }

    private String translateTelegramError(Exception e) {
        String msg = e.getMessage() != null ? e.getMessage() : "";
        if (msg.contains("401") || msg.contains("Unauthorized"))
            return "Invalid Bot Token. Copy it exactly from @BotFather — it looks like 123456789:AAFxxx...";
        if (msg.contains("can't send messages to the bot") || msg.contains("bot can't"))
            return "Wrong Chat ID — you entered a bot ID, not a personal chat ID. To get your Chat ID: (1) Send any message to your bot in Telegram first, (2) open https://api.telegram.org/bot{YOUR_TOKEN}/getUpdates in a browser, (3) find 'chat':{\"id\": ...} — that number is your Chat ID.";
        if (msg.contains("400") || msg.contains("Bad Request") || msg.contains("chat not found"))
            return "Chat ID not found. Make sure you have sent at least one message to your bot first, then verify the Chat ID using https://api.telegram.org/bot{YOUR_TOKEN}/getUpdates.";
        if (msg.contains("403") || msg.contains("Forbidden"))
            return "Forbidden: the bot cannot send to this chat. Make sure you sent /start to the bot first, and the Chat ID belongs to your personal account (not another bot).";
        if (msg.contains("Connection") || msg.contains("timed out"))
            return "Could not reach Telegram API. Check your server's internet connection or outbound HTTPS access.";
        return "Telegram send failed: " + msg;
    }

    private String translateWhatsAppError(Exception e) {
        String msg = e.getMessage() != null ? e.getMessage() : "";
        if (msg.contains("401") || msg.contains("403") || msg.contains("Unauthorized") || msg.contains("Forbidden"))
            return "WhatsApp API rejected the request. Check that the API Key is correct.";
        if (msg.contains("404") || msg.contains("Not Found"))
            return "The API URL was not found (404). Double-check the API URL for your WhatsApp gateway provider.";
        if (msg.contains("Connection") || msg.contains("timed out"))
            return "Could not reach the WhatsApp API URL. Check the URL and your server's internet connection.";
        return "WhatsApp send failed: " + msg;
    }
}
