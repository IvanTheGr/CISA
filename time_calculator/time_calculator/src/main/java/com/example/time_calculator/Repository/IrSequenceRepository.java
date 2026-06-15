package com.example.time_calculator.Repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class IrSequenceRepository {

    private final JdbcTemplate jdbcTemplate;

    public IrSequenceRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional
    public Long getNextTicketNumber() {

        Long number = jdbcTemplate.queryForObject(
                """
                SELECT number_next
                FROM ir_sequence
                WHERE code = 'website.support.ticket'
                """,
                Long.class
        );

        jdbcTemplate.update(
                """
                UPDATE ir_sequence
                SET number_next = number_next + number_increment
                WHERE code = 'website.support.ticket'
                """
        );

        return number;
    }
}
