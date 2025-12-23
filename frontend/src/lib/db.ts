import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'nilelink',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT || '5432'),
});

export interface Investor {
  id: number;
  wallet_address: string;
  name: string;
  email: string;
  kyc_status: string;
  created_at: Date;
}

export interface Restaurant {
  id: number;
  restaurant_address: string;
  chain_id: number;
  name: string;
  country: string;
  local_currency: string;
  daily_rate_limit_usd6: number;
  tax_bps: number;
  status: string;
}

export interface Investment {
  id: number;
  investor_id: number;
  restaurant_id: number;
  amount_usd6: number;
  ownership_bps: number;
  start_date: Date;
}

export interface RestaurantKPI {
  restaurant_id: number;
  date: string;
  revenue_usd6: number;
  profit_usd6: number;
  orders_count: number;
  customers_count: number;
  avg_order_value_usd6: number;
  delivery_success_rate: number;
  customer_satisfaction: number;
}

export interface Dividend {
  id: number;
  investment_id: number;
  amount_usd6: number;
  period_start: Date;
  period_end: Date;
  payout_date?: Date;
  tx_hash?: string;
  status: string;
}

export interface Alert {
  id: number;
  restaurant_id: number;
  alert_type: string;
  severity: string;
  message: string;
  metadata: any;
  resolved_at?: Date;
  created_at: Date;
}

export class Database {
  static async getInvestorByWallet(walletAddress: string): Promise<Investor | null> {
    const query = 'SELECT * FROM investors WHERE wallet_address = $1';
    const result = await pool.query(query, [walletAddress]);
    return result.rows[0] || null;
  }

  static async getInvestorPortfolio(investorId: number) {
    const query = `
      SELECT 
        i.*,
        r.name as restaurant_name,
        r.restaurant_address,
        r.country,
        r.local_currency
      FROM investments i
      JOIN restaurants r ON i.restaurant_id = r.id
      WHERE i.investor_id = $1
    `;
    const result = await pool.query(query, [investorId]);
    return result.rows;
  }

  static async getInvestorPortfolioSummary(investorId: number) {
    const query = `
      SELECT 
        SUM(i.amount_usd6) as total_invested,
        SUM(i.ownership_bps) as total_ownership_bps,
        COUNT(i.id) as restaurant_count,
        COALESCE(SUM(d.amount_usd6), 0) as total_dividends
      FROM investments i
      LEFT JOIN dividends d ON i.id = d.investment_id AND d.status = 'paid'
      WHERE i.investor_id = $1
    `;
    const result = await pool.query(query, [investorId]);
    return result.rows[0];
  }

  static async getRestaurantKPIs(restaurantId: number, days: number = 30) {
    const query = `
      SELECT *
      FROM restaurant_kpis
      WHERE restaurant_id = $1
      AND date >= CURRENT_DATE - INTERVAL '${days} days'
      ORDER BY date DESC
    `;
    const result = await pool.query(query, [restaurantId]);
    return result.rows;
  }

  static async getRestaurantLatestKPI(restaurantId: number): Promise<RestaurantKPI | null> {
    const query = `
      SELECT *
      FROM restaurant_kpis
      WHERE restaurant_id = $1
      ORDER BY date DESC
      LIMIT 1
    `;
    const result = await pool.query(query, [restaurantId]);
    return result.rows[0] || null;
  }

  static async getRestaurantMetrics(restaurantId: number) {
    const query = `
      SELECT 
        SUM(revenue_usd6) as total_revenue,
        SUM(profit_usd6) as total_profit,
        SUM(customers_count) as total_customers,
        SUM(orders_count) as total_orders,
        AVG(delivery_success_rate) as avg_delivery_success
      FROM restaurant_kpis
      WHERE restaurant_id = $1
      AND date >= CURRENT_DATE - INTERVAL '30 days'
    `;
    const result = await pool.query(query, [restaurantId]);
    return result.rows[0];
  }

  static async getDividendHistory(investorId: number, limit: number = 100) {
    const query = `
      SELECT 
        d.*,
        i.amount_usd6 as investment_amount,
        r.name as restaurant_name,
        r.restaurant_address
      FROM dividends d
      JOIN investments i ON d.investment_id = i.id
      JOIN restaurants r ON i.restaurant_id = r.id
      WHERE i.investor_id = $1
      ORDER BY d.created_at DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [investorId, limit]);
    return result.rows;
  }

  static async getAccruedDividends(investorId: number) {
    const query = `
      SELECT 
        COALESCE(SUM(d.amount_usd6), 0) as accrued_dividends
      FROM dividends d
      JOIN investments i ON d.investment_id = i.id
      WHERE i.investor_id = $1
      AND d.status = 'pending'
    `;
    const result = await pool.query(query, [investorId]);
    return result.rows[0].accrued_dividends;
  }

  static async getAllRestaurants(chainId?: number) {
    let query = 'SELECT * FROM restaurants WHERE status = $1';
    const params = ['active'];
    
    if (chainId) {
      query += ' AND chain_id = $2';
      params.push(chainId.toString());
    }
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async getRestaurantChain(chainId: number) {
    const query = 'SELECT * FROM restaurant_chains WHERE id = $1';
    const result = await pool.query(query, [chainId]);
    return result.rows[0] || null;
  }

  static async getChainMetrics(chainId: number) {
    const query = `
      SELECT 
        COUNT(DISTINCT r.id) as restaurant_count,
        COUNT(DISTINCT r.country) as country_count,
        SUM(k.revenue_usd6) as total_revenue,
        SUM(k.profit_usd6) as total_profit,
        AVG(k.delivery_success_rate) as avg_delivery_success,
        SUM(k.customers_count) as total_customers,
        SUM(k.orders_count) as total_orders
      FROM restaurants r
      JOIN restaurant_kpis k ON r.id = k.restaurant_id
      WHERE r.chain_id = $1
      AND k.date >= CURRENT_DATE - INTERVAL '30 days'
    `;
    const result = await pool.query(query, [chainId]);
    return result.rows[0];
  }

  static async getAlerts(restaurantId?: number, severity?: string, limit: number = 50) {
    let query = `
      SELECT a.*, r.name as restaurant_name
      FROM alerts a
      JOIN restaurants r ON a.restaurant_id = r.id
      WHERE resolved_at IS NULL
    `;
    const params: any[] = [];
    
    if (restaurantId) {
      params.push(restaurantId);
      query += ` AND a.restaurant_id = $${params.length}`;
    }
    
    if (severity) {
      params.push(severity);
      query += ` AND a.severity = $${params.length}`;
    }
    
    query += ` ORDER BY a.created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async createAlert(alertData: Partial<Alert>) {
    const query = `
      INSERT INTO alerts (restaurant_id, alert_type, severity, message, metadata)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [
      alertData.restaurant_id,
      alertData.alert_type,
      alertData.severity,
      alertData.message,
      JSON.stringify(alertData.metadata || {})
    ]);
    return result.rows[0];
  }

  static async resolveAlert(alertId: number) {
    const query = `
      UPDATE alerts 
      SET resolved_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [alertId]);
    return result.rows[0];
  }

  static async getStaffAccounts(restaurantId?: number) {
    let query = `
      SELECT s.*, r.name as restaurant_name
      FROM staff_accounts s
      JOIN restaurants r ON s.restaurant_id = r.id
      WHERE s.status = $1
    `;
    const params = ['active'];
    
    if (restaurantId) {
      params.push(restaurantId.toString());
      query += ` AND s.restaurant_id = $${params.length}`;
    }
    
    query += ' ORDER BY s.created_at DESC';
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async createStaffAccount(staffData: any) {
    const query = `
      INSERT INTO staff_accounts (restaurant_id, email, role, permissions)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [
      staffData.restaurant_id,
      staffData.email,
      staffData.role,
      JSON.stringify(staffData.permissions || {})
    ]);
    return result.rows[0];
  }

  static async updateStaffAccount(staffId: number, updates: any) {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = [staffId, ...Object.values(updates)];
    const query = `UPDATE staff_accounts SET ${setClause} WHERE id = $1 RETURNING *`;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getExchangeRates(restaurantId: number, limit: number = 100) {
    const query = `
      SELECT *
      FROM exchange_rates
      WHERE restaurant_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [restaurantId, limit]);
    return result.rows;
  }

  static async updateExchangeRate(restaurantId: number, currencyPair: string, rate: number, source: string = 'chainlink') {
    const query = `
      INSERT INTO exchange_rates (restaurant_id, currency_pair, rate, source)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [restaurantId, currencyPair, rate, source]);
    return result.rows[0];
  }

  static async getTransactionAuditLog(restaurantId?: number, limit: number = 100) {
    let query = `
      SELECT *
      FROM transaction_audit_log
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (restaurantId) {
      params.push(restaurantId);
      query += ` AND restaurant_id = $${params.length}`;
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async addToAuditLog(restaurantId: number, txHash: string, eventType: string, eventData: any) {
    const query = `
      INSERT INTO transaction_audit_log (restaurant_id, tx_hash, event_type, event_data, block_number)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [
      restaurantId,
      txHash,
      eventType,
      JSON.stringify(eventData),
      eventData.blockNumber || 0
    ]);
    return result.rows[0];
  }
}