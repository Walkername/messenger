package ru.walkername.backend.friendship.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "friendship")
public class Friendship {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "subscriber_id")
    private Long subscriberId;

    @Column(name = "target_id")
    private Long targetId;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private FriendshipStatus status;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    public Friendship(Long subscriberId, Long targetId, FriendshipStatus status, Instant createdAt, Instant updatedAt) {
        this.subscriberId = subscriberId;
        this.targetId = targetId;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
