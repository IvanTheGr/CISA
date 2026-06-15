package com.example.time_calculator.Service;

import com.example.time_calculator.Entity.PtapWebSupportSla;
import com.example.time_calculator.Entity.SupportTicket;
import com.example.time_calculator.Entity.WebsiteSupportSlaAlert;
import com.example.time_calculator.Entity.WebsiteSupportSlaRule;
import com.example.time_calculator.Repository.PtapWebSupportSlaRepository;
import com.example.time_calculator.Repository.WebsiteSupportSlaRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SlaEngineService {

    private final PtapWebSupportSlaRepository slaRepository;

    public void attachSla(SupportTicket ticket) {

        Long partnerIdForSla =
                ticket.getParentCompanyId() != null
                        ? ticket.getParentCompanyId()
                        : ticket.getPartnerId();

        if (partnerIdForSla == null ||
                ticket.getProductId() == null ||
                ticket.getPriorityId() == null) {

            System.out.println("SLA skipped because fields are null");
            return;
        }

        var slaOpt =
                slaRepository.findFirstByPartner_IdAndProduct_IdAndPriority_Id(
                        partnerIdForSla,
                        ticket.getProductId(),
                        ticket.getPriorityId()
                );

        if (slaOpt.isEmpty()) {
            System.out.println("SLA not found");
            ticket.setSlaActive(false);
            return;
        }

        PtapWebSupportSla sla = slaOpt.get();

        /* ================= APPLY SLA ================= */

        ticket.setSlaId(sla.getId());
        ticket.setResponseTime(sla.getResponseTime());
        ticket.setResolutionTime(sla.getResolutionTime());
        ticket.setCountdownCondition(sla.getCountdownCondition());
        ticket.setWarningResolutionTime(sla.getWarningResolutionTime());

        ticket.setSlaActive(true);

        System.out.println("SLA attached: " + sla.getId());
    }
}