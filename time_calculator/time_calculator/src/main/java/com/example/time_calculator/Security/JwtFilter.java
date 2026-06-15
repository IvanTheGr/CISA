package com.example.time_calculator.Security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

/**
 * JwtFilter — reads the AUTH_TOKEN HTTP-only cookie and populates
 * Spring's SecurityContext.
 *
 * FIX: On an invalid / expired token we now clear the context and
 * continue the filter chain (instead of aborting with 401).
 * Spring Security's own authorization rules will then enforce
 * which endpoints are protected. This prevents the filter from
 * incorrectly blocking public endpoints when the cookie is absent
 * or malformed, while still protecting all authenticated endpoints.
 */
@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String token = extractTokenFromCookie(request);

        if (token != null) {
            try {
                Claims claims = jwtService.extractClaims(token);

                String username = claims.getSubject();
                List<String> roles = claims.get("roles", List.class);
                if (roles == null) roles = Collections.emptyList();

                var authorities = roles.stream()
                        .map(SimpleGrantedAuthority::new)
                        .toList();

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                username, null, authorities
                        );
                auth.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );
                SecurityContextHolder.getContext().setAuthentication(auth);

            } catch (JwtException | IllegalArgumentException e) {
                // Token is invalid or expired.
                // Clear the context and CONTINUE — do not abort here.
                // Spring Security's authorization layer will reject
                // requests to protected endpoints with 401/403.
                SecurityContextHolder.clearContext();
            }
        }

        // Always continue the filter chain regardless of token validity.
        filterChain.doFilter(request, response);
    }

    private String extractTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;

        for (Cookie cookie : cookies) {
            if ("AUTH_TOKEN".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
