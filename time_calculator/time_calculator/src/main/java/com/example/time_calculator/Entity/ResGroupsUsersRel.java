//package com.example.time_calculator.Entity;
//
//import jakarta.persistence.*;
//import lombok.Data;
//
//@Entity
//@Table(name = "res_groups_users_rel")
//@Data
//public class ResGroupsUsersRel {
//
//    @EmbeddedId
//    private ResGroupsUsersRelId id;
//
//    // Optional: kalau mau relasi object juga
//    @ManyToOne(fetch = FetchType.LAZY)
//    @MapsId("uid")
//    @JoinColumn(name = "uid", insertable = false, updatable = false)
//    private ResUsers user;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @MapsId("gid")
//    @JoinColumn(name = "gid", insertable = false, updatable = false)
//    private ResGroups group;
//}