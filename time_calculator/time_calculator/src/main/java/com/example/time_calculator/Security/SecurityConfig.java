package com.example.time_calculator.Security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .httpBasic(httpBasic -> httpBasic.disable())
                .formLogin(form -> form.disable())
                .logout(logout -> logout.disable())
                .headers(headers -> headers
                        .frameOptions(frame -> frame.deny())
                        .contentSecurityPolicy(csp ->
                                csp.policyDirectives("default-src 'self'")
                        )
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/login", "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        .requestMatchers("/api/profile").authenticated()
                        .requestMatchers("/api/products/**").authenticated()
                        .requestMatchers("/support-users/**").authenticated()

                        .requestMatchers(HttpMethod.GET, "/incident/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/incident/**").authenticated()

                        .requestMatchers("/metabase/dashboard").authenticated()
                        .requestMatchers("/metabase/export/**").authenticated()

                        .requestMatchers(HttpMethod.GET, "/ticket/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/ticket/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/ticket/**").authenticated()

                        .requestMatchers(HttpMethod.GET, "/message/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/message/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/message/**").authenticated()

                        .requestMatchers("/my/**").authenticated()
                        .requestMatchers("/auth/me-ticket").authenticated()

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}