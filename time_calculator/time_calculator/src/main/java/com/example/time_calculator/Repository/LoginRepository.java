package com.example.time_calculator.Repository;

import com.example.time_calculator.Entity.ResUsers;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoginRepository extends JpaRepository<ResUsers, Long> {

    Optional<ResUsers> findByLoginAndActiveTrue(String login);

}
