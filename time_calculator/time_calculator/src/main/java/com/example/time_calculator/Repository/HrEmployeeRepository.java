package com.example.time_calculator.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.time_calculator.Entity.HrEmployee;

@Repository
public interface HrEmployeeRepository extends JpaRepository<HrEmployee, Long> {

    Optional<HrEmployee> findByUserId(Long userId);

    default Optional<String> findEmailByUserId(Long userId) {
        return findByUserId(userId).map(HrEmployee::getWorkEmail);
    }

    default Optional<String> findMobileByUserId(Long userId) {
        return findByUserId(userId).map(HrEmployee::getMobilePhone);
    }
}
