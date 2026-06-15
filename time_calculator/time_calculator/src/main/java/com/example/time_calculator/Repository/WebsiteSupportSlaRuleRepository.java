package com.example.time_calculator.Repository;

import com.example.time_calculator.Entity.WebsiteSupportSlaRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WebsiteSupportSlaRuleRepository
        extends JpaRepository<WebsiteSupportSlaRule, Integer> {

    Optional<WebsiteSupportSlaRule>
    findFirstBySla_Id(Integer slaId);

}