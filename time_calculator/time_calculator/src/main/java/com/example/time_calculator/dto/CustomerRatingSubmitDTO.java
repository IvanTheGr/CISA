package com.example.time_calculator.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CustomerRatingSubmitDTO {

    @NotNull(message = "Rating wajib diisi")
    @Min(value = 1, message = "Rating minimal 1")
    @Max(value = 5, message = "Rating maksimal 5")
    private Integer rating;

    private String comment;
}