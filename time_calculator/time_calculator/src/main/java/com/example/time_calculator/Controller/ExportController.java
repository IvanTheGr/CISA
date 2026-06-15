package com.example.time_calculator.Controller;

import com.example.time_calculator.Repository.ResUsersRepository;
import com.example.time_calculator.Service.ExcelTemplateService;
import com.example.time_calculator.Service.MetabaseExportService;
import com.example.time_calculator.Service.MetabaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;

@RestController
@RequestMapping("/metabase")
@RequiredArgsConstructor
public class ExportController {

    private final MetabaseService metabaseService;
    private final MetabaseExportService exportService;
    private final ExcelTemplateService excelTemplateService;
    private final ResUsersRepository repository;

    /**
     * Legacy export endpoint — tanpa template
     */
    @GetMapping("/export")
    public ResponseEntity<byte[]> exportExcel(Authentication authentication) throws IOException {

        String partnerName = repository.findPartnerNameByLogin(authentication.getName());
        boolean isPrivileged = metabaseService.isPrivileged(authentication);

        byte[] excelBytes;

        if (isPrivileged) {
            excelBytes = exportService.exportAll();
        } else {
            excelBytes = exportService.exportByPartner(partnerName);
        }

        String filename = "dashboard-export-" + LocalDate.now() + ".xlsx";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"")
                .body(excelBytes);
    }

    /**
     * Excel export dengan template + filter dashboard
     */
    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportExcelTemplate(
            Authentication authentication,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String partnerName
    ) throws IOException {

        boolean isPrivileged = metabaseService.isPrivileged(authentication);

        /*
         * Jika user bukan admin / privileged
         * paksa partner mengikuti partner user login
         */
        if (!isPrivileged) {
            partnerName = repository.findPartnerNameByLogin(authentication.getName());
        }

        byte[] excelBytes = excelTemplateService.exportFiltered(
                startDate,
                endDate,
                partnerName
        );

        String filename = "incident-report-" + LocalDate.now() + ".xlsx";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"")
                .body(excelBytes);
    }
}