package com.example.time_calculator.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateTicketDTO {

    private Long partnerId;

    @NotNull(message = "Priority wajib dipilih")
    private Long priorityId;

    @NotNull(message = "Product wajib dipilih")
    private Long productId;

    private Long categoryId;

    private Long subCategoryId;

    @NotBlank(message = "Subject wajib diisi")
    @Size(max = 255)
    private String subject;

    @NotBlank(message = "Description wajib diisi")
    private String descriptionText;

    private String channel;
    private String personName;
    private String email;
}