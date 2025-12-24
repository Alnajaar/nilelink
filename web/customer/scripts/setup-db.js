const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'nilelink',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

const schema = `
-- Investors table
CREATE TABLE IF NOT EXISTS investors (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    kyc_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Restaurant chains table
CREATE TABLE IF NOT EXISTS restaurant_chains (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_wallet_address VARCHAR(42) NOT NULL,
    country_code VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
    id SERIAL PRIMARY KEY,
    restaurant_address VARCHAR(42) UNIQUE NOT NULL,
    chain_id INTEGER REFERENCES restaurant_chains(id),
    name VARCHAR(255) NOT NULL,
    country VARCHAR(10) NOT NULL,
    local_currency VARCHAR(10) NOT NULL,
    daily_rate_limit_usd6 BIGINT DEFAULT 1000000000,
    tax_bps INTEGER DEFAULT 0,
    chainlink_oracle VARCHAR(42),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Investments table
CREATE TABLE IF NOT EXISTS investments (
    id SERIAL PRIMARY KEY,
    investor_id INTEGER REFERENCES investors(id),
    restaurant_id INTEGER REFERENCES restaurants(id),
    amount_usd6 BIGINT NOT NULL,
    ownership_bps INTEGER NOT NULL,
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(investor_id, restaurant_id)
);

-- Dividends table
CREATE TABLE IF NOT EXISTS dividends (
    id SERIAL PRIMARY KEY,
    investment_id INTEGER REFERENCES investments(id),
    amount_usd6 BIGINT NOT NULL,
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    payout_date TIMESTAMP,
    tx_hash VARCHAR(66),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Restaurant KPIs table
CREATE TABLE IF NOT EXISTS restaurant_kpis (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id),
    date DATE NOT NULL,
    revenue_usd6 BIGINT DEFAULT 0,
    profit_usd6 BIGINT DEFAULT 0,
    orders_count INTEGER DEFAULT 0,
    customers_count INTEGER DEFAULT 0,
    avg_order_value_usd6 INTEGER DEFAULT 0,
    delivery_success_rate DECIMAL(5,2) DEFAULT 100.00,
    customer_satisfaction DECIMAL(3,2) DEFAULT 5.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(restaurant_id, date)
);

-- Staff accounts table
CREATE TABLE IF NOT EXISTS staff_accounts (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id),
    email VARCHAR(255),
    phone_hash VARCHAR(255),
    role VARCHAR(50) NOT NULL,
    permissions JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active',
    invitation_code VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exchange rates table
CREATE TABLE IF NOT EXISTS exchange_rates (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id),
    currency_pair VARCHAR(20) NOT NULL,
    rate DECIMAL(20,10) NOT NULL,
    source VARCHAR(50) DEFAULT 'chainlink',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id),
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Compliance records table
CREATE TABLE IF NOT EXISTS compliance_records (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id),
    country VARCHAR(10) NOT NULL,
    kyc_status VARCHAR(50) DEFAULT 'pending',
    tax_id VARCHAR(255),
    compliance_data JSONB DEFAULT '{}',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions audit log
CREATE TABLE IF NOT EXISTS transaction_audit_log (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id),
    tx_hash VARCHAR(66) UNIQUE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL,
    block_number INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_investors_wallet ON investors(wallet_address);
CREATE INDEX IF NOT EXISTS idx_restaurants_address ON restaurants(restaurant_address);
CREATE INDEX IF NOT EXISTS idx_restaurants_chain ON restaurants(chain_id);
CREATE INDEX IF NOT EXISTS idx_investments_investor ON investments(investor_id);
CREATE INDEX IF NOT EXISTS idx_investments_restaurant ON investments(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_dividends_investment ON dividends(investment_id);
CREATE INDEX IF NOT EXISTS idx_kpis_restaurant_date ON restaurant_kpis(restaurant_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_restaurant ON alerts(restaurant_id) WHERE resolved_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_audit_restaurant ON transaction_audit_log(restaurant_id, created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_investors_updated_at BEFORE UPDATE ON investors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

async function setupDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Setting up NileLink database schema...');
    await client.query(schema);
    console.log('✅ Database schema created successfully!');
    
    // Insert sample data
    console.log('Inserting sample data...');
    
    // Sample investors
    await client.query(`
      INSERT INTO investors (wallet_address, name, email, kyc_status) VALUES
      ('0x742d35Cc6634C0532925a38aB4D52dC1Eb550A25', 'Alice Johnson', 'alice@nilelink.com', 'verified'),
      ('0x8ba1f109551bD432803012635b006615F5f523B1', 'Bob Smith', 'bob@nilelink.com', 'verified'),
      ('0x5aAeb6053F3E94C9b9A09f33669435E7Ef1fBeAe', 'Carol Davis', 'carol@nilelink.com', 'verified')
      ON CONFLICT (wallet_address) DO NOTHING;
    `);
    
    // Sample restaurant chains
    await client.query(`
      INSERT INTO restaurant_chains (name, owner_wallet_address, country_code) VALUES
      ('Lebanese Delights', '0x742d35Cc6634C0532925a38aB4D52dC1Eb550A25', 'LB'),
      ('Egyptian Eats', '0x8ba1f109551bD432803012635b006615F5f523B1', 'EG'),
      ('Syrian Sweets', '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1fBeAe', 'SY')
      ON CONFLICT DO NOTHING;
    `);
    
    // Sample restaurants
    await client.query(`
      INSERT INTO restaurants (restaurant_address, chain_id, name, country, local_currency, daily_rate_limit_usd6, tax_bps, status) VALUES
      ('0x742d35Cc6634C0532925a38aB4D52dC1Eb550A25', 1, 'Beirut Bistro', 'LB', 'LBP', 10000000000, 1000, 'active'),
      ('0x8ba1f109551bD432803012635b006615F5f523B1', 1, 'Tripoli Tavern', 'LB', 'LBP', 5000000000, 1000, 'active'),
      ('0x5aAeb6053F3E94C9b9A09f33669435E7Ef1fBeAe', 2, 'Cairo Corner', 'EG', 'EGP', 15000000000, 1500, 'active'),
      ('0xF0aC78f7714a4d54AEC677fdB93e5b1A927B1ed7', 2, 'Alexandria Eatery', 'EG', 'EGP', 8000000000, 1500, 'active'),
      ('0x6dC851571f4a13886553E4C012924151Af7B9151', 3, 'Damascus Diner', 'SY', 'SYP', 20000000000, 800, 'active')
      ON CONFLICT (restaurant_address) DO NOTHING;
    `);
    
    // Sample investments
    await client.query(`
      INSERT INTO investments (investor_id, restaurant_id, amount_usd6, ownership_bps) VALUES
      (1, 1, 100000000000, 2000),  -- Alice invests $100K in Beirut Bistro, 20% ownership
      (1, 2, 75000000000, 1500),   -- Alice invests $75K in Tripoli Tavern, 15% ownership
      (2, 3, 150000000000, 3000),  -- Bob invests $150K in Cairo Corner, 30% ownership
      (3, 4, 50000000000, 1000),   -- Carol invests $50K in Alexandria Eatery, 10% ownership
      (3, 5, 125000000000, 2500)   -- Carol invests $125K in Damascus Diner, 25% ownership
      ON CONFLICT (investor_id, restaurant_id) DO NOTHING;
    `);
    
    // Sample KPIs (last 30 days)
    const kpiData = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      kpiData.push(
        `(1, '${dateStr}', 5000000000, 1250000000, 500, 2000, 10000000, 98.5, 4.6)`,
        `(2, '${dateStr}', 4000000000, 1000000000, 400, 1500, 10000000, 97.8, 4.5)`,
        `(3, '${dateStr}', 6000000000, 1500000000, 600, 2500, 10000000, 98.9, 4.7)`,
        `(4, '${dateStr}', 3500000000, 875000000, 350, 1200, 10000000, 97.2, 4.4)`,
        `(5, '${dateStr}', 7000000000, 1750000000, 700, 3000, 10000000, 99.1, 4.8)`
      );
    }
    
    await client.query(`
      INSERT INTO restaurant_kpis (restaurant_id, date, revenue_usd6, profit_usd6, orders_count, customers_count, avg_order_value_usd6, delivery_success_rate, customer_satisfaction)
      VALUES ${kpiData.join(', ')}
      ON CONFLICT (restaurant_id, date) DO NOTHING;
    `);
    
    console.log('✅ Sample data inserted successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase().catch(console.error);