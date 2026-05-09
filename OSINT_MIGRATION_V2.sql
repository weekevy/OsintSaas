-- ========================================================
-- OSINT MODULES DATABASE MIGRATION - V2 (Final Comprehensive)
-- Execute this script in phpMyAdmin to create/update tables
-- ========================================================

USE osint_db;

-- 1. LINKEDIN SCANS
CREATE TABLE IF NOT EXISTS linkedin_scans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scan_id INT NOT NULL UNIQUE,
    profile_url VARCHAR(500),
    profile_name VARCHAR(255),
    profile_headline TEXT,
    profile_location VARCHAR(255),
    connections_list TEXT,
    mutual_connections TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE,
    INDEX idx_scan_id (scan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. SOCIAL MEDIA SCANS
CREATE TABLE IF NOT EXISTS social_media_scans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scan_id INT NOT NULL UNIQUE,
    platform VARCHAR(100),
    profile_url VARCHAR(500),
    username VARCHAR(255),
    display_name VARCHAR(255),
    bio TEXT,
    post_count INT DEFAULT 0,
    follower_count VARCHAR(100),
    following_count VARCHAR(100),
    suspicious_posts TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE,
    INDEX idx_scan_id (scan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. SCAM WEBSITE SCANS
CREATE TABLE IF NOT EXISTS scam_website_scans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scan_id INT NOT NULL UNIQUE,
    website_url VARCHAR(500),
    domain_name VARCHAR(255),
    ip_address VARCHAR(45),
    red_flags_list TEXT,
    fake_reviews TEXT,
    payment_requests TEXT,
    registrar VARCHAR(255),
    registration_date DATE,
    expiry_date DATE,
    registrant_country VARCHAR(100),
    is_private_registration VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE,
    INDEX idx_scan_id (scan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. CRYPTO WALLET SCANS
CREATE TABLE IF NOT EXISTS crypto_wallet_scans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scan_id INT NOT NULL UNIQUE,
    wallet_address VARCHAR(255),
    blockchain VARCHAR(50),
    wallet_provider VARCHAR(255),
    transaction_hash VARCHAR(255),
    amount_sent VARCHAR(100),
    recipient_address VARCHAR(255),
    transaction_date DATETIME,
    known_scam VARCHAR(50),
    scam_reports TEXT,
    suspicious_patterns TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE,
    INDEX idx_scan_id (scan_id),
    INDEX idx_wallet_address (wallet_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. EMAIL LEAK SCANS
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

-- 6. SCAM EMAIL SCANS
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

-- 7. PHONE NUMBER SCANS
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

-- 8. PROJECT PROGRESS FIX
INSERT INTO projects (user_id, name, description, status, created_at)
SELECT id, 'Default Project', 'Default project for investigations', 'active', NOW()
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM projects p WHERE p.user_id = u.id AND p.name = 'Default Project'
);
