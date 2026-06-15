package com.example.time_calculator.dto;

import java.util.List;
import java.util.Map;

import lombok.Data;

@Data
public class ReminderConfigDto {

    private String id;               // "customerProduct" | "pm"
    private boolean enabled;
    private int startDaysBefore;
    private int repeatEveryDays;
    private int keepRemindingDays;

    /** Which PICs receive the reminder: "l1", "l2", "sales", or any combo */
    private List<String> assignTo;

    /** Which channels are active: "inApp", "email", "whatsapp", "telegram" */
    private List<String> channels;

    /**
     * Per-channel config fields.
     * email    → smtpHost, smtpPort, smtpUser, smtpPass, fromName
     * whatsapp → apiUrl, apiKey, phone
     * telegram → botToken, chatId
     */
    private Map<String, Map<String, String>> channelConfigs;
}
