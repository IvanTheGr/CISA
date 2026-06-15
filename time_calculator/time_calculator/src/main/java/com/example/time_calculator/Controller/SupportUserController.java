package com.example.time_calculator.Controller;

import com.example.time_calculator.Service.SupportUserService;
import com.example.time_calculator.dto.SupportUserOptionDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/support-users")
@RequiredArgsConstructor
public class SupportUserController {

    private final SupportUserService supportUserService;

    @GetMapping
    public List<SupportUserOptionDTO> getSupportUsers() {
        return supportUserService.getSupportUsers();
    }
}