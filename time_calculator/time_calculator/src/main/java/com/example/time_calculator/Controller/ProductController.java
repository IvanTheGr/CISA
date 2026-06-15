package com.example.time_calculator.Controller;

import com.example.time_calculator.Service.ProductService;
import com.example.time_calculator.dto.ProductResponseDTO;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * NEW controller — does NOT touch or extend SupportTicketController.
 *
 * GET /api/products/my-products
 *   Returns all products linked to the authenticated user's tickets.
 *   Auth: cookie JWT (AUTH_TOKEN) via JwtFilter — same as every other endpoint.
 */
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    /* ── GET /api/products/my-products ─────────────────────────────────── */
    @GetMapping("/my-products")
    public ResponseEntity<?> getMyProducts() {
        try {
            List<ProductResponseDTO> products = productService.getProductsForCurrentUser();
            return ResponseEntity.ok(products);
        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
