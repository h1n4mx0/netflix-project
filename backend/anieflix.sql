-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               11.7.2-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for anieflix_db
CREATE DATABASE IF NOT EXISTS `anieflix_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;
USE `anieflix_db`;

-- Dumping structure for table anieflix_db.movie_comments
CREATE TABLE IF NOT EXISTS `movie_comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `movie_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `anonymous_name` varchar(100) DEFAULT 'Người dùng ẩn danh',
  `parent_id` int(11) DEFAULT NULL,
  `likes_count` int(11) DEFAULT 0,
  `dislikes_count` int(11) DEFAULT 0,
  `is_deleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_movie_id` (`movie_id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `movie_comments_ibfk_1` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `movie_comments_ibfk_2` FOREIGN KEY (`parent_id`) REFERENCES `show_comments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table anieflix_db.movie_comments: ~3 rows (approximately)
INSERT INTO `movie_comments` (`id`, `movie_id`, `content`, `anonymous_name`, `parent_id`, `likes_count`, `dislikes_count`, `is_deleted`, `created_at`, `updated_at`) VALUES
	(1, 320, 'hiii', 'anonymous', NULL, 0, 0, 0, '2025-06-11 03:52:35', '2025-06-11 03:52:35'),
	(2, 320, 'aaaa', 'anonymous', NULL, 0, 0, 0, '2025-06-11 03:52:45', '2025-06-11 03:52:45'),
	(3, 320, 'ahhaha', 'anonymous', NULL, 0, 0, 0, '2025-06-11 03:53:51', '2025-06-11 03:53:51'),
	(4, 146, 'phim hay vl', 'hai nam', NULL, 0, 0, 0, '2025-06-11 05:34:16', '2025-06-11 05:34:16'),
	(5, 3, 'cccc', 'hai nam', NULL, 0, 0, 0, '2025-06-11 06:21:53', '2025-06-11 06:21:53'),
	(6, 366, 'test', 'hai nam', NULL, 0, 0, 0, '2025-06-11 06:22:03', '2025-06-11 06:22:03');

-- Dumping structure for table anieflix_db.movie_comment_reactions
CREATE TABLE IF NOT EXISTS `movie_comment_reactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `comment_id` int(11) NOT NULL,
  `user_identifier` varchar(255) NOT NULL,
  `reaction_type` enum('like','dislike') NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_reaction` (`comment_id`,`user_identifier`),
  KEY `idx_comment_id` (`comment_id`),
  CONSTRAINT `movie_comment_reactions_ibfk_1` FOREIGN KEY (`comment_id`) REFERENCES `movie_comments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table anieflix_db.movie_comment_reactions: ~0 rows (approximately)

-- Dumping structure for table anieflix_db.show_comments
CREATE TABLE IF NOT EXISTS `show_comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `show_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `anonymous_name` varchar(100) DEFAULT 'Người dùng ẩn danh',
  `parent_id` int(11) DEFAULT NULL,
  `likes_count` int(11) DEFAULT 0,
  `dislikes_count` int(11) DEFAULT 0,
  `is_deleted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_show_id` (`show_id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `show_comments_ibfk_1` FOREIGN KEY (`show_id`) REFERENCES `shows` (`id`) ON DELETE CASCADE,
  CONSTRAINT `show_comments_ibfk_2` FOREIGN KEY (`parent_id`) REFERENCES `show_comments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table anieflix_db.show_comments: ~2 rows (approximately)
INSERT INTO `show_comments` (`id`, `show_id`, `content`, `anonymous_name`, `parent_id`, `likes_count`, `dislikes_count`, `is_deleted`, `created_at`, `updated_at`) VALUES
	(1, 1, 'hiii', 'anonymous', NULL, 0, 0, 0, '2025-06-11 03:43:07', '2025-06-11 03:43:07'),
	(2, 1, 'show nay hay phet', 'hai nam', NULL, 0, 0, 0, '2025-06-11 04:18:13', '2025-06-11 04:18:13');

-- Dumping structure for table anieflix_db.show_comment_reactions
CREATE TABLE IF NOT EXISTS `show_comment_reactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `comment_id` int(11) NOT NULL,
  `user_identifier` varchar(255) NOT NULL,
  `reaction_type` enum('like','dislike') NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_reaction` (`comment_id`,`user_identifier`),
  KEY `idx_comment_id` (`comment_id`),
  CONSTRAINT `show_comment_reactions_ibfk_1` FOREIGN KEY (`comment_id`) REFERENCES `show_comments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table anieflix_db.show_comment_reactions: ~0 rows (approximately)

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
