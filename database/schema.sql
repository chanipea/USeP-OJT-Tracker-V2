-- =========================================================
-- USeP OJT Hours Tracker - Database Schema
-- =========================================================
-- Import this file into MySQL/MariaDB (e.g. via phpMyAdmin
-- or: mysql -u root -p < schema.sql)
--
-- NOTE: This version adds user accounts. If you're upgrading
-- from a version without accounts, this will DROP your old
-- profile/ojt_logs tables (see DROP statements below) since
-- every row now needs to belong to a user. Back up first if
-- you need to keep old data, then manually re-insert it under
-- the right user_id after creating your account.
-- =========================================================

CREATE DATABASE IF NOT EXISTS usep_ojt_tracker_v2
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE usep_ojt_tracker_v2;

-- Drop old tables if they exist without user_id (safe re-run for dev)
DROP TABLE IF EXISTS ojt_logs;
DROP TABLE IF EXISTS profile;
DROP TABLE IF EXISTS users;

-- ---------------------------------------------------------
-- Table: users
-- One row per account. Passwords are never stored in plain
-- text - only a bcrypt hash (see backend/api/register.php,
-- which uses PHP's password_hash()).
-- auth_token is a random string issued at login and sent by
-- the frontend on every request (like a simple API key) so
-- the backend knows which account is making the request.
-- ---------------------------------------------------------
CREATE TABLE users (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username      VARCHAR(50) NOT NULL,
  email         VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  auth_token    VARCHAR(64) NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_email (email),
  UNIQUE KEY uniq_username (username),
  KEY idx_auth_token (auth_token)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Table: profile
-- One row per user (user_id is both the primary key and the
-- foreign key - a strict 1-to-1 relationship). Created
-- automatically, empty, the moment someone signs up.
-- target_hours defaults to 0 (was 600 before accounts existed) -
-- the student now sets their own target after signing up.
-- ---------------------------------------------------------
CREATE TABLE profile (
  user_id         INT UNSIGNED NOT NULL,
  name            VARCHAR(150) NOT NULL DEFAULT '',
  student_id      VARCHAR(50)  NOT NULL DEFAULT '',
  program         VARCHAR(150) NOT NULL DEFAULT '',
  company         VARCHAR(150) NOT NULL DEFAULT '',
  supervisor      VARCHAR(150) NOT NULL DEFAULT '',
  target_hours    INT UNSIGNED NOT NULL DEFAULT 0,
  bio             TEXT NULL,
  email           VARCHAR(150) NOT NULL DEFAULT '',
  phone           VARCHAR(50)  NOT NULL DEFAULT '',
  profile_picture LONGTEXT NULL,
  cover_photo     LONGTEXT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_profile_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Table: ojt_logs
-- Every log entry belongs to exactly one user (user_id).
-- Deleting a user automatically deletes their logs too
-- (ON DELETE CASCADE), so accounts can be removed cleanly.
-- ---------------------------------------------------------
CREATE TABLE ojt_logs (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     INT UNSIGNED NOT NULL,
  log_date    DATE NOT NULL,
  start_time  TIME NOT NULL,
  end_time    TIME NOT NULL,
  hours       DECIMAL(6,2) NOT NULL DEFAULT 0,
  tasks       TEXT NOT NULL,
  diary       TEXT NOT NULL,
  moods       JSON NULL,
  categories  JSON NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_date (user_id, log_date),
  CONSTRAINT fk_logs_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
