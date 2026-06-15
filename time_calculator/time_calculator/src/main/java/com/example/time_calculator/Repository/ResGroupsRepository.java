package com.example.time_calculator.Repository;

import com.example.time_calculator.Entity.ResGroups;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResGroupsRepository extends JpaRepository<ResGroups, Long> {

    Optional<ResGroups> findByName(String name);

    boolean existsByName(String name);

    @Query(value = """
        SELECT COUNT(DISTINCT rel.uid)
        FROM res_groups_users_rel rel
        WHERE rel.gid = :groupId
    """, nativeQuery = true)
    int countUsersByGroupId(@Param("groupId") Long groupId);

    @Query(value = """
        SELECT g.id, g.name
        FROM res_groups g
        WHERE g.share = false OR g.share IS NULL
        ORDER BY g.id ASC
    """, nativeQuery = true)
    List<Object[]> findNonSharedGroups();

    // Assign user to group
    @Modifying
    @Query(value = """
        INSERT INTO res_groups_users_rel (gid, uid)
        VALUES (:groupId, :userId)
        ON CONFLICT DO NOTHING
    """, nativeQuery = true)
    void assignUserToGroup(@Param("groupId") Long groupId, @Param("userId") Long userId);

    // Remove user from all groups then reassign
    @Modifying
    @Query(value = """
        DELETE FROM res_groups_users_rel WHERE uid = :userId
    """, nativeQuery = true)
    void removeUserFromAllGroups(@Param("userId") Long userId);

    // Find groups for a specific user
    @Query(value = """
        SELECT g.id, g.name
        FROM res_groups g
        JOIN res_groups_users_rel rel ON rel.gid = g.id
        WHERE rel.uid = :userId
    """, nativeQuery = true)
    List<Object[]> findGroupsByUserId(@Param("userId") Long userId);
}
