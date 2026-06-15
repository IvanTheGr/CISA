package com.example.time_calculator.Controller;

import com.example.time_calculator.Entity.PtapWebSupportSla;
import com.example.time_calculator.Repository.PtapWebSupportSlaRepository;
import com.example.time_calculator.Repository.ProductTemplateRepository;
import com.example.time_calculator.Repository.ResPartnerRepository;
import com.example.time_calculator.Repository.TicketPriorityRepository;
import com.example.time_calculator.dto.SlaConfigDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/sla-config")
@RequiredArgsConstructor
public class SlaConfigController {

    private final PtapWebSupportSlaRepository slaRepo;
    private final ResPartnerRepository         partnerRepo;
    private final ProductTemplateRepository    productRepo;
    private final TicketPriorityRepository     priorityRepo;

    // ── CRUD ────────────────────────────────────────────────────────────────

    @GetMapping
    public List<SlaConfigDto> getAll() {
        return slaRepo.findAll().stream().map(this::toDto).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SlaConfigDto> getById(@PathVariable Long id) {
        return slaRepo.findById(id)
                .map(e -> ResponseEntity.ok(toDto(e)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<SlaConfigDto> create(@RequestBody SlaConfigDto dto) {
        PtapWebSupportSla entity = applyDto(dto, new PtapWebSupportSla());
        entity.setCreateDate(LocalDateTime.now());
        entity.setWriteDate(LocalDateTime.now());
        return ResponseEntity.ok(toDto(slaRepo.save(entity)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SlaConfigDto> update(@PathVariable Long id, @RequestBody SlaConfigDto dto) {
        return slaRepo.findById(id).map(existing -> {
            applyDto(dto, existing);
            existing.setWriteDate(LocalDateTime.now());
            return ResponseEntity.ok(toDto(slaRepo.save(existing)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!slaRepo.existsById(id)) return ResponseEntity.notFound().build();
        slaRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ── Lookup endpoints for dropdown data ──────────────────────────────────

    @GetMapping("/lookup/partners")
    public List<Map<String, Object>> getPartners() {
        return partnerRepo.findTop20ByActiveTrueAndCustomerTrueAndNameContainingIgnoreCase("")
                .stream()
                .map(p -> Map.<String, Object>of("id", p.getId(), "name",
                        p.getDisplayName() != null ? p.getDisplayName() : p.getName()))
                .toList();
    }

    @GetMapping("/lookup/products")
    public List<Map<String, Object>> getProducts() {
        return productRepo.findAllActiveProducts()
                .stream()
                .map(p -> Map.<String, Object>of("id", p.getId(), "name", p.getName()))
                .toList();
    }

    @GetMapping("/lookup/priorities")
    public List<Map<String, Object>> getPriorities() {
        return priorityRepo.findAll()
                .stream()
                .map(p -> Map.<String, Object>of("id", p.getId(), "name", p.getName()))
                .toList();
    }

    // ── Mapping helpers ──────────────────────────────────────────────────────

    private SlaConfigDto toDto(PtapWebSupportSla e) {
        SlaConfigDto dto = new SlaConfigDto();
        dto.setId(e.getId());
        if (e.getPartner() != null) {
            dto.setPartnerId(e.getPartner().getId());
            dto.setPartnerName(e.getPartner().getDisplayName() != null
                    ? e.getPartner().getDisplayName() : e.getPartner().getName());
        }
        if (e.getProduct() != null) {
            dto.setProductId(e.getProduct().getId());
            dto.setProductName(e.getProduct().getName());
        }
        if (e.getPriority() != null) {
            dto.setPriorityId(e.getPriority().getId());
            dto.setPriorityName(e.getPriority().getName());
        }
        dto.setResponseTime(e.getResponseTime());
        dto.setResolutionTime(e.getResolutionTime());
        dto.setCountdownCondition(e.getCountdownCondition());
        dto.setWarningResolutionTime(e.getWarningResolutionTime());
        return dto;
    }

    private PtapWebSupportSla applyDto(SlaConfigDto dto, PtapWebSupportSla entity) {
        if (dto.getPartnerId()  != null) entity.setPartner(partnerRepo.findById(dto.getPartnerId()).orElse(null));
        if (dto.getProductId()  != null) entity.setProduct(productRepo.findById(dto.getProductId()).orElse(null));
        if (dto.getPriorityId() != null) entity.setPriority(priorityRepo.findById(dto.getPriorityId()).orElse(null));
        entity.setResponseTime(dto.getResponseTime());
        entity.setResolutionTime(dto.getResolutionTime());
        entity.setCountdownCondition(dto.getCountdownCondition());
        entity.setWarningResolutionTime(dto.getWarningResolutionTime());
        return entity;
    }
}
