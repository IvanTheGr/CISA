package com.example.time_calculator.Service;

import com.example.time_calculator.Entity.ResPartner;
import com.example.time_calculator.Repository.ResPartnerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PartnerService {

    private final ResPartnerRepository partnerRepository;

    public Long resolvePartnerId(Long userPartnerId){

        ResPartner partner = partnerRepository
                .findById(userPartnerId)
                .orElseThrow();

        if(partner.getParent() != null){
            return partner.getParent().getId();
        }

        return partner.getId();
    }
}