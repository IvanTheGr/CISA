package com.example.time_calculator.Repository;

import com.example.time_calculator.dto.CustomerDropdownDTO;
import com.example.time_calculator.dto.CustomerNameDropdownDTO;
import com.example.time_calculator.Entity.ResPartner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.stream.Collectors;

public interface ResPartnerRepository extends JpaRepository<ResPartner, Long> {


    List<ResPartner> findTop20ByActiveTrueAndCustomerTrueAndNameContainingIgnoreCase(String name);

    @Query("""
    SELECT new com.example.time_calculator.dto.CustomerDropdownDTO(
        p.id,
        p.displayName,
        p.parent.id,
        p.parent.name
    )
    FROM ResPartner p
    WHERE p.active = true
    AND LOWER(p.displayName) LIKE LOWER(CONCAT('%', :search, '%'))
    ORDER BY p.displayName
    """)
    List<CustomerDropdownDTO> searchCustomersCreate(@Param("search") String search);

    @Query(value = """
        SELECT
            rp.id,
            COALESCE(parent.name, rp.name)  AS display_name,
            rp.parent_id,
            parent.name                     AS parent_name
        FROM res_partner rp
        LEFT JOIN res_partner parent ON parent.id = rp.parent_id
        WHERE LOWER(rp.name) LIKE LOWER(CONCAT('%', :search, '%'))
        ORDER BY display_name ASC
        LIMIT 50
        """, nativeQuery = true)
    List<Object[]> searchCustomersRaw(@Param("search") String search);

    default List<CustomerDropdownDTO> searchCustomers(String search) {
        return searchCustomersRaw(search)
                .stream()
                .map(row -> new CustomerDropdownDTO(
                        row[0] != null ? ((Number) row[0]).longValue() : null,
                        (String) row[1],
                        row[2] != null ? ((Number) row[2]).longValue() : null,
                        (String) row[3]
                ))
                .collect(Collectors.toList());
    }

    @Query(value = """
        SELECT DISTINCT
            COALESCE(parent.name, rp.name) AS company_name
        FROM website_support_ticket wst
        JOIN res_partner rp
            ON rp.id = wst.partner_id
        LEFT JOIN res_partner parent
            ON parent.id = rp.parent_id
        WHERE
            LOWER(COALESCE(parent.name, rp.name)) LIKE LOWER(CONCAT('%', :search, '%'))
        ORDER BY company_name ASC
        LIMIT 50
        """, nativeQuery = true)
    List<Object[]> searchCustomersByNameRaw(@Param("search") String search);

    default List<CustomerNameDropdownDTO> searchCustomersByName(String search) {
        List<CustomerNameDropdownDTO> result = new ArrayList<>();
        long syntheticId = 1L;
        for (Object[] row : searchCustomersByNameRaw(search)) {
            String companyName = (String) row[0];
            // id is synthetic here — the filter uses companyName string, not id
            result.add(new CustomerNameDropdownDTO(syntheticId++, companyName, companyName));
        }
        return result;
    }
}