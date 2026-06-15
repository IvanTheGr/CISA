package com.example.time_calculator.Repository;

import com.example.time_calculator.Entity.PtapWebSupportSla;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PtapWebSupportSlaRepository
        extends JpaRepository<PtapWebSupportSla, Long> {

    Optional<PtapWebSupportSla>
    findFirstByPartner_IdAndProduct_IdAndPriority_Id(
            Long partnerId,
            Long productId,
            Long priorityId
    );

}
