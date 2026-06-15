package com.example.time_calculator.Service;

import com.example.time_calculator.dto.ReminderConfigDto;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory store for reminder configurations.
 * Keyed by reminder id ("customerProduct" or "pm").
 * Survives for the lifetime of the JVM process — no DB table needed.
 */
@Component
public class ReminderConfigStore {

    private final Map<String, ReminderConfigDto> store = new ConcurrentHashMap<>();

    public ReminderConfigStore() {
        store.put("customerProduct", defaultConfig("customerProduct"));
        store.put("pm",              defaultConfig("pm"));
    }

    public List<ReminderConfigDto> getAll() {
        return List.copyOf(store.values());
    }

    public ReminderConfigDto get(String id) {
        return store.get(id);
    }

    public void save(ReminderConfigDto dto) {
        store.put(dto.getId(), dto);
    }

    private ReminderConfigDto defaultConfig(String id) {
        ReminderConfigDto dto = new ReminderConfigDto();
        dto.setId(id);
        dto.setEnabled(false);
        dto.setStartDaysBefore(7);
        dto.setRepeatEveryDays(1);
        dto.setKeepRemindingDays(3);
        dto.setAssignTo(List.of("l1"));
        dto.setChannels(List.of("inApp"));
        dto.setChannelConfigs(Map.of());
        return dto;
    }

}
