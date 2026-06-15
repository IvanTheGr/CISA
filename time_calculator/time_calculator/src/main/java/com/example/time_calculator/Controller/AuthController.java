package com.example.time_calculator.Controller;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.time_calculator.Entity.ResUsers;
import com.example.time_calculator.Repository.ResUsersRepository;
import com.example.time_calculator.Security.JwtService;
import com.example.time_calculator.Service.AuthService;
import com.example.time_calculator.dto.LoginRequestDTO;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final ResUsersRepository repository;

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequestDTO request,
                                     HttpServletRequest requestHttp,
                                     HttpServletResponse response) {

        ResUsers user = authService.login(
                request.getLogin(),
                request.getPassword()
        );

        // 🔥 ambil role dari DB
        List<String> roles = repository.findGroupNamesByLogin(user.getLogin());

        String token = jwtService.generateToken(user.getLogin(), roles);

        boolean secureCookie = requestHttp.isSecure();
        ResponseCookie.ResponseCookieBuilder cookieBuilder = ResponseCookie.from("AUTH_TOKEN", token)
                .httpOnly(true)
                .secure(secureCookie)
                .path("/")
                .maxAge(Duration.ofHours(2));

        if (secureCookie) {
            cookieBuilder.sameSite("None");
        } else {
            cookieBuilder.sameSite("Lax");
        }

        response.addHeader("Set-Cookie", cookieBuilder.build().toString());

        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", user.getId());
        userInfo.put("login", user.getLogin());
        userInfo.put("active", user.getActive());
        userInfo.put("companyId", user.getCompanyId());
        userInfo.put("employeeId", user.getEmployeeId());

        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("user", userInfo);
        result.put("roles", roles);
        result.put("message", "Login success");
        return result;
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