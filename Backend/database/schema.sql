CREATE DATABASE IF NOT EXISTS abisat_et
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE abisat_et;

CREATE TABLE IF NOT EXISTS posts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(250) NOT NULL,
  content TEXT NOT NULL,
  image VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_posts_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS receiver_files (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  file_type ENUM('software', 'loader') NOT NULL,
  description VARCHAR(1000) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_receiver_files_brand_type (brand, file_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS channels (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  satellite VARCHAR(100) NOT NULL,
  channel_name VARCHAR(200) NOT NULL,
  frequency VARCHAR(100) NOT NULL DEFAULT '',
  biss_key VARCHAR(100) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_channels_satellite (satellite)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELETE FROM channels
WHERE (satellite = 'Nilesat' AND channel_name = 'Channel One')
   OR (satellite = 'Eutelsat 7' AND channel_name = 'Channel Two');
