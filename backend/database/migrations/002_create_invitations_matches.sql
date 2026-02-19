-- 002_create_invitations_matches.sql

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS invitations;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE invitations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inviter_id INT NOT NULL,
    invitee_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'expired', 'cancelled') NOT NULL DEFAULT 'pending',
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_invitations_inviter
        FOREIGN KEY (inviter_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_invitations_invitee
        FOREIGN KEY (invitee_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    INDEX idx_invitations_invitee_status (invitee_id, status),
    INDEX idx_invitations_expires_at (expires_at)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player1_id INT NOT NULL,
    player2_id INT NOT NULL,
    status ENUM('pending', 'active', 'completed', 'cancelled') NOT NULL,
    winner_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_matches_player1
        FOREIGN KEY (player1_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_matches_player2
        FOREIGN KEY (player2_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_matches_winner
        FOREIGN KEY (winner_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    INDEX idx_matches_status (status),
    INDEX idx_matches_player1 (player1_id),
    INDEX idx_matches_player2 (player2_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
