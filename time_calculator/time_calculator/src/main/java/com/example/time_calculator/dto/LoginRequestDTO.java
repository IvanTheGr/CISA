package com.example.time_calculator.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequestDTO {

    @NotBlank(message = "Login wajib diisi")
    private String login;

    @NotBlank(message = "Password wajib diisi")
    private String password;
    private Boolean active;

}
