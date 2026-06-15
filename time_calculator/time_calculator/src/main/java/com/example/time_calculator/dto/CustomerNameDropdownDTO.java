package com.example.time_calculator.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CustomerNameDropdownDTO {

    private Long id;
    private String name;
    private String companyName;  // ✅ ADDED: COALESCE(parent.name, rp.name)

}
