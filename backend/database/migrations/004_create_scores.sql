-- 004_create_scores.sql
-- Creates scores table for match results and leaderboard tracking

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS scores;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE scores (
    id INT AUTO_INCREMENT PRIMARY KEY,

    match_id INT NOT NULL,
    player_id INT NOT NULL,

    score INT NOT NULL
        COMMENT 'Current total score for player after this match',

    score_change INT NOT NULL
        COMMENT 'Score change for this match (+10 for win, -5 for loss)',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_scores_match
        FOREIGN KEY (match_id)
        REFERENCES matches(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_scores_player
        FOREIGN KEY (player_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    INDEX idx_scores_player_id (player_id),
    INDEX idx_scores_match_id (match_id),
    INDEX idx_scores_player_score (player_id, score)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
