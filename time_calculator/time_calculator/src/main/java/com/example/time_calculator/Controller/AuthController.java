package com.example.time_calculator.Controller;

import com.example.time_calculator.Entity.ResUsers;
import com.example.time_calculator.Repository.ResUsersRepository;
import com.example.time_calculator.Security.JwtService;
import com.example.time_calculator.Service.AuthService;
import com.example.time_calculator.dto.LoginRequestDTO;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final ResUsersRepository repository;

    @PostMapping("/login")
    public String login(@RequestBody LoginRequestDTO request,
                        HttpServletResponse response) {

        ResUsers user = authService.login(
                request.getLogin(),
                request.getPassword()
        );

        // 🔥 ambil role dari DB
        List<String> roles = repository.findGroupNamesByLogin(user.getLogin());

        String token = jwtService.generateToken(user.getLogin(), roles);

        ResponseCookie cookie = ResponseCookie.from("AUTH_TOKEN", token)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(Duration.ofHours(2))
                .sameSite("None")
                .build();

        response.addHeader("Set-Cookie", cookie.toString());

        return "Login success";
    }

    @GetMapping("/me")
    public Map<String, Object> getCurrentUser(Authentication authentication) {

        String username = authentication.getName();

        String partnerName = repository.findPartnerNameByLogin(username);

        List<String> roles = authentication.getAuthorities()
                .stream()
                .map(a -> a.getAuthority())
                .toList();

        return Map.of(
                "partnerName", partnerName,
                "roles", roles
        );
    }

    @GetMapping("/me-ticket")
    public Map<String,Object> getCurrentUserForTicket(Authentication authentication){

        String username = authentication.getName();

        Map<String,Object> partner = repository.findPartnerForTicket(username);

        List<String> roles = authentication.getAuthorities()
                .stream()
                .map(a -> a.getAuthority())
                .toList();

        Map<String,Object> result = new HashMap<>();

        result.put("partnerId", partner.get("partnerId"));
        result.put("displayName", partner.get("displayName"));
        result.put("parentName", partner.get("parentName"));
        result.put("email", partner.get("email"));
        result.put("roles", roles);

        return result;
    }


    @PostMapping("/logout")
    public String logout(HttpServletResponse response) {

        ResponseCookie cookie = ResponseCookie.from("AUTH_TOKEN", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .sameSite("None")
                .build();

        response.addHeader("Set-Cookie", cookie.toString());

        return "Logout success";


    }


}