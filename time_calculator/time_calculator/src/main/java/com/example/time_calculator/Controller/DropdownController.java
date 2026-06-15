package com.example.time_calculator.Controller;

import com.example.time_calculator.Entity.ProductTemplate;
import com.example.time_calculator.Entity.ResUsers;
import com.example.time_calculator.Repository.ProductTemplateRepository;
import com.example.time_calculator.Repository.ResPartnerRepository;
import com.example.time_calculator.Repository.ResUsersRepository;
import com.example.time_calculator.Repository.TicketPriorityRepository;
import com.example.time_calculator.Security.SecurityRoleUtil;
import com.example.time_calculator.Service.PartnerService;
import com.example.time_calculator.dto.CustomerDropdownDTO;
import com.example.time_calculator.dto.CustomerNameDropdownDTO;
import com.example.time_calculator.dto.PriorityOptionDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/dropdown")
@RequiredArgsConstructor
public class DropdownController {

    private final ResPartnerRepository partnerRepository;
    private final ProductTemplateRepository productRepository;
    private final TicketPriorityRepository priorityRepository;
    private final ResUsersRepository resUsersRepository;
    private final SecurityRoleUtil roleUtil;
    private final PartnerService partnerService;

    @GetMapping("/customers")
    public List<CustomerDropdownDTO> getCustomers(
            @RequestParam(defaultValue = "") String search
    ) {
        return partnerRepository.searchCustomersCreate(search);
    }

    @GetMapping("/products")
    public List<ProductTemplate> getProducts(
            Authentication auth,
            @RequestParam(required = false) Long partnerId
    ) {
        if (roleUtil.isPrivileged(auth)) {
            if (partnerId != null) {
                Long resolvedId = partnerService.resolvePartnerId(partnerId);
                return productRepository.findProductsByPartner(resolvedId);
            }
            return productRepository.findAllActiveProducts();
        }

        String login = auth.getName();
        ResUsers user = resUsersRepository
                .findByLoginAndActiveTrue(login)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long targetPartnerId = (partnerId != null)
                ? partnerId
                : user.getPartner().getId();

        Long resolvedId = partnerService.resolvePartnerId(targetPartnerId);
        return productRepository.findProductsByPartner(resolvedId);
    }

    @GetMapping("/priorities")
    public ResponseEntity<?> getPriorities() {
        try {
            List<PriorityOptionDTO> result = priorityRepository.findAll()
                    .stream()
                    .map(p -> new PriorityOptionDTO(p.getId(), p.getName()))
                    .toList();

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("PRIORITIES ERROR: " + e.getMessage());
        }
    }

    @GetMapping("/customers-name")
    public List<CustomerNameDropdownDTO> getCustomersByName(
            @RequestParam(defaultValue = "") String search
    ) {
        return partnerRepository.searchCustomersByName(search);
    }
}