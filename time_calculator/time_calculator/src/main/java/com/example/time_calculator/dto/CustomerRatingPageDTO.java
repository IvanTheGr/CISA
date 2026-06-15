package com.example.time_calculator.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerRatingPageDTO {

    private List<CustomerRatingTicketDTO> pendingRating;
    private List<CustomerRatingTicketDTO> ratingHistory;
}