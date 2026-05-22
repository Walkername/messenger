package ru.walkername.backend.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "refresh_token")
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private  Long id;

    @Column(name = "account_id")
    private Long accountId;

    @Column(name = "token_hash")
    private String tokenHash;

    @Column(name = "created_at")
    private Instant createdAt;

    public RefreshToken(Long accountId, String tokenHash) {
        this.accountId = accountId;
        this.tokenHash = tokenHash;
    }
}
