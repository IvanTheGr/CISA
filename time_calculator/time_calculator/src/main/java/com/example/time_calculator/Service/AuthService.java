package com.example.time_calculator.Service;

import com.example.time_calculator.Entity.ResUsers;
import com.example.time_calculator.Repository.ResUsersRepository;
import com.example.time_calculator.Security.PasswordUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final ResUsersRepository repository;

    public ResUsers login(String login, String password) {

        ResUsers user = repository.findByLoginAndActiveTrue(login)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!PasswordUtil.verify(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return user;
    }
}