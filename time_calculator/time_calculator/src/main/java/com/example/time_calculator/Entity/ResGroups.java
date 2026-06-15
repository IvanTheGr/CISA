package com.example.time_calculator.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "res_groups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResGroups {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String name;

    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    @Column(name = "create_uid")
    private Long createUid;

    @Column(name = "write_uid")
    private Long writeUid;

    @Column(name = "share")
    private Boolean share;

    // Many-to-many with res_users via res_groups_users_rel
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "res_groups_users_rel",
        joinColumns = @JoinColumn(name = "gid"),
        inverseJoinColumns = @JoinColumn(name = "uid")
    )
    private List<ResUsers> users;
}
