package com.example.time_calculator.Service;

import com.example.time_calculator.Security.SecurityRoleUtil;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@RequiredArgsConstructor
public class MetabaseService {

    private final SecurityRoleUtil roleUtil;

    @Value("${metabase.url}")
    private String metabaseUrl;

    @Value("${metabase.secret}")
    private String secret;

    @Value("${metabase.dashboard.id}")
    private Integer dashboardId;

    public boolean isPrivileged(Authentication auth) {
        return roleUtil.isPrivileged(auth);
    }

    public String generateDashboardEmbedUrl(
            Authentication auth,
            String partnerName,
            String startDate,
            String endDate
    ) {

        long exp = System.currentTimeMillis() / 1000 + (10 * 60);

        Map<String, Object> payload = new HashMap<>();
        payload.put("resource", Map.of("dashboard", dashboardId));

        Map<String,Object> params = new HashMap<>();

        boolean privileged = roleUtil.isPrivileged(auth);

        if (!privileged && partnerName != null && !partnerName.isEmpty()) {
            params.put("partner_name", partnerName);
        }

        if (privileged && partnerName != null && !partnerName.isEmpty()) {
            params.put("partner_name", partnerName);
        }

        if (startDate != null && endDate != null &&
                !startDate.isEmpty() && !endDate.isEmpty()) {

            params.put("date_range", startDate + "~" + endDate);
        }

        payload.put("params", params);
        payload.put("exp", exp);

        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));

        String token = Jwts.builder()
                .setClaims(payload)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        String options;

        if (privileged) {
            options ="#hide_parameters=date_range,partner_name" +
                    "&bordered=true&titled=true";
        } else {
            options = "#bordered=true&titled=true";
        }

        return metabaseUrl + "/embed/dashboard/" + token + options;
    }
}