package com.example.time_calculator.Repository;

import com.example.time_calculator.Entity.ResUsers;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface UserManagementRepository extends JpaRepository<ResUsers, Long> {

    Optional<ResUsers> findByLogin(String login);

    boolean existsByLogin(String login);

    @Query("""
        SELECT u FROM ResUsers u
        JOIN u.partner p
        WHERE u.active = true
        AND (u.share = false OR u.share IS NULL)
    """)
    Page<ResUsers> findAllActiveInternalUsers(Pageable pageable);

    @Query("""
        SELECT u FROM ResUsers u
        JOIN u.partner p
        WHERE (u.share = false OR u.share IS NULL)
    """)
    Page<ResUsers> findAllInternalUsers(Pageable pageable);

    // Count summaries for the stat cards
    @Query(value = """
        SELECT COUNT(*) FROM res_users u
        WHERE (u.share = false OR u.share IS NULL)
        AND u.id > 1
    """, nativeQuery = true)
    long countTotalUsers();

    @Query(value = """
        SELECT COUNT(DISTINCT u.id) FROM res_users u
        WHERE (u.share = false OR u.share IS NULL)
        AND u.id > 1
        AND u.active = true
        AND u.write_date >= NOW() - INTERVAL '5 minutes'
    """, nativeQuery = true)
    long countOnlineUsers();

    @Query(value = """
        SELECT COUNT(*) FROM res_users u
        WHERE (u.share = false OR u.share IS NULL)
        AND u.id > 1
        AND u.active = false
    """, nativeQuery = true)
    long countInactiveUsers();

    @Query(value = """
        SELECT COUNT(*) FROM res_users u
        WHERE (u.share = false OR u.share IS NULL)
        AND u.id > 1
        AND u.active = true
        AND u.write_date IS NULL
    """, nativeQuery = true)
    long countPendingUsers();

    @Query(value = """
        SELECT
            u.id,
            u.login,
            u.active,
            u.create_date,
            u.write_date,
            p.name as partner_name,
            p.email,
            p.phone,
            (SELECT string_agg(g.name, ', ')
             FROM res_groups g
             JOIN res_groups_users_rel rel ON rel.gid = g.id
             WHERE rel.uid = u.id) as group_names
        FROM res_users u
        JOIN res_partner p ON p.id = u.partner_id
        WHERE (u.share = false OR u.share IS NULL)
        AND u.id > 1
        ORDER BY u.id ASC
        LIMIT :limit OFFSET :offset
    """, nativeQuery = true)
    List<Object[]> findUsersWithDetails(@Param("limit") int limit, @Param("offset") int offset);

    @Query(value = """
        SELECT
            u.id,
            u.login,
            u.active,
            u.create_date,
            u.write_date,
            p.name as partner_name,
            p.email,
            p.phone,
            (SELECT string_agg(g.name, ', ')
             FROM res_groups g
             JOIN res_groups_users_rel rel ON rel.gid = g.id
             WHERE rel.uid = u.id) as group_names
        FROM res_users u
        JOIN res_partner p ON p.id = u.partner_id
        WHERE (u.share = false OR u.share IS NULL)
        AND u.id > 1
    """, nativeQuery = true)
    List<Object[]> findAllUsersWithDetails();

    // get partner_id for a login
    @Query("""
        SELECT u.partner.id FROM ResUsers u WHERE u.login = :login
    """)
    Optional<Long> findPartnerIdByLogin(@Param("login") String login);
}
