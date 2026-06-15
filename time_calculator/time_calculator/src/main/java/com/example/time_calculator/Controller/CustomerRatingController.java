package com.example.time_calculator.Controller;

import com.example.time_calculator.Service.CustomerRatingService;
import com.example.time_calculator.dto.CustomerRatingPageDTO;
import com.example.time_calculator.dto.CustomerRatingSubmitDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/customer-rating")
@RequiredArgsConstructor
public class CustomerRatingController {

    private final CustomerRatingService customerRatingService;

    @GetMapping("/my")
    public ResponseEntity<CustomerRatingPageDTO> getMyRatingPage(Authentication authentication) {
        return ResponseEntity.ok(
                customerRatingService.getMyRatingPage(authentication.getName())
        );
    }

    @PostMapping("/submit/{ticketId}")
    public ResponseEntity<?> submitRating(
            @PathVariable Long ticketId,
            @Valid @RequestBody CustomerRatingSubmitDTO dto,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                customerRatingService.submitRating(ticketId, dto, authentication.getName())
        );
    }
}