-- SQL Script for OSINT Module Tables
-- Run this in phpMyAdmin if tables are missing

USE osint_db;

-- 1. SOCIAL MEDIA SCANS
CREATE TABLE IF NOT EXISTS social_media_scans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scan_id INT NOT NULL UNIQUE,
    twitter_url VARCHAR(500),
    facebook_url VARCHAR(500),
    instagram_url VARCHAR(500),
    tiktok_url VARCHAR(500),
    youtube_url VARCHAR(500),
    reddit_url VARCHAR(500),
    display_name VARCHAR(255),
    username_variations TEXT,
    profile_pictures TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE,
    INDEX idx_scan_id (scan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. SCAM WEBSITE SCANS
CREATE TABLE IF NOT EXISTS scam_website_scans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scan_id INT NOT NULL UNIQUE,
    website_url VARCHAR(500),
    website_name VARCHAR(255),
    ip_address VARCHAR(45),
    hosting_provider VARCHAR(255),
    registration_date DATE,
    suspicious_patterns TEXT,
    fake_testimonials TEXT,
    payment_methods TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE,
    INDEX idx_scan_id (scan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. CRYPTO WALLET SCANS
CREATE TABLE IF NOT EXISTS crypto_wallet_scans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scan_id INT NOT NULL UNIQUE,
    wallet_address VARCHAR(255),
    blockchain VARCHAR(50),
    exchange VARCHAR(100),
    notes TEXT,
    transaction_count INT DEFAULT 0,
    balance VARCHAR(100),
    risk_score INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE,
    INDEX idx_scan_id (scan_id),
    INDEX idx_wallet_address (wallet_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. EMAIL LEAK SCANS
CREATE TABLE IF NOT EXISTS email_leak_scans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scan_id INT NOT NULL UNIQUE,
    email_address VARCHAR(255),
    additional_emails TEXT,
    breach_count INT DEFAULT 0,
    breach_details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE,
    INDEX idx_scan_id (scan_id),
    INDEX idx_email_address (email_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. SCAM EMAIL SCANS
CREATE TABLE IF NOT EXISTS scam_email_scans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scan_id INT NOT NULL UNIQUE,
    sender_email VARCHAR(255),
    sender_name VARCHAR(255),
    subject VARCHAR(500),
    email_body TEXT,
    attachments TEXT,
    headers_raw TEXT,
    reply_to VARCHAR(255),
    return_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE,
    INDEX idx_scan_id (scan_id),
    INDEX idx_sender_email (sender_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. PHONE NUMBER SCANS
CREATE TABLE IF NOT EXISTS phone_number_scans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scan_id INT NOT NULL UNIQUE,
    phone_number VARCHAR(50),
    carrier VARCHAR(100),
    country VARCHAR(100),
    risk_score INT DEFAULT 0,
    spam_reports INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE,
    INDEX idx_scan_id (scan_id),
    INDEX idx_phone_number (phone_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
