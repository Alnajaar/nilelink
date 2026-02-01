-- Database Schema for Affiliate Program

-- Users Table (if not exists)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    wallet_address VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'CUSTOMER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Affiliates Table
CREATE TABLE IF NOT EXISTS affiliates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    referral_code VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    commission_rate DECIMAL(5,2) DEFAULT 0.10,
    lifetime_earnings DECIMAL(15,2) DEFAULT 0,
    pending_earnings DECIMAL(15,2) DEFAULT 0,
    balance DECIMAL(15,2) DEFAULT 0,
    tier VARCHAR(50) DEFAULT 'BRONZE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Referrals Table
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID REFERENCES affiliates(id),
    business_id UUID, -- Could be another user ID or merchant ID
    business_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'REGISTERED',
    commission_rate DECIMAL(5,2) DEFAULT 0.10,
    total_commission_earned DECIMAL(15,2) DEFAULT 0,
    first_order_date TIMESTAMP WITH TIME ZONE,
    last_activity_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Commissions Table
CREATE TABLE IF NOT EXISTS commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID REFERENCES referrals(id),
    amount DECIMAL(15,2) NOT NULL,
    order_id VARCHAR(255),
    description TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP WITH TIME ZONE
);

-- Payout Requests Table
CREATE TABLE IF NOT EXISTS payout_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID REFERENCES affiliates(id),
    amount DECIMAL(15,2) NOT NULL,
    method VARCHAR(100) NOT NULL,
    details JSONB,
    status VARCHAR(50) DEFAULT 'REQUESTED',
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE
);
