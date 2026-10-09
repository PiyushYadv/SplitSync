package com.splitsync.entity;

import java.time.Instant;

import org.hibernate.annotations.CreationTimestamp;

import com.splitsync.entity.enums.MemberRole;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "group_members")
@Getter
@Setter
@NoArgsConstructor
public class GroupMember {

    @EmbeddedId
    private GroupMemberId id;

    @MapsId("groupId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "group_id")
    private ExpenseGroup group;

    @MapsId("userId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 20)
    private MemberRole role = MemberRole.MEMBER;

    @CreationTimestamp
    @Column(name = "joined_at", nullable = false, updatable = false)
    private Instant joinedAt;

    public GroupMember(ExpenseGroup group, User user, MemberRole role) {
        this.id = new GroupMemberId(group.getId(), user.getId());
        this.group = group;
        this.user = user;
        this.role = role;
    }
}
