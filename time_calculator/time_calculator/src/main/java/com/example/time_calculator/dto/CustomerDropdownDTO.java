package com.example.time_calculator.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CustomerDropdownDTO {

    private Long id;
    private String displayName;
    private Long parentId;
    private String parentName;

}
