const WebSocket = require('ws');
const redis = require('redis');
const { createServer } = require('http');

const PORT = process.env.WS_PORT || 8080;

class NileLinkWebSocketServer {
  constructor() {
    this.wss = null;
    this.redisClient = null;
    this.redisSubscriber = null;
    this.clients = new Map();
    
    // Channel mappings
    this.channels = {
      'investor-dashboard': new Set(),
      'admin-dashboard': new Set(),
      'kpi-updates': new Set(),
      'alerts': new Set()
    };
  }

  async initialize() {
    // Initialize Redis clients
    this.redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    
    this.redisSubscriber = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    
    this.redisClient.on('error', (err) => console.error('Redis Client Error:', err));
    this.redisSubscriber.on('error', (err) => console.error('Redis Subscriber Error:', err));
    
    await this.redisClient.connect();
    await this.redisSubscriber.connect();
    
    // Subscribe to Redis channels
    await this.redisSubscriber.subscribe('nilelink:updates', (message) => {
      this.broadcastToChannel('kpi-updates', JSON.parse(message));
    });
    
    await this.redisSubscriber.subscribe('nilelink:alerts', (message) => {
      this.broadcastToChannel('alerts', JSON.parse(message));
    });
    
    // Initialize WebSocket server
    const server = createServer();
    this.wss = new WebSocket.Server({ server });
    
    this.setupWebSocketHandlers();
    
    server.listen(PORT, () => {
      console.log(`🚀 WebSocket server running on port ${PORT}`);
    });
    
    // Start periodic KPI updates
    this.startKPIUpdates();
    
    // Start periodic alerts check
    this.startAlertsCheck();
  }

  setupWebSocketHandlers() {
    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId();
      this.clients.set(clientId, { ws, channels: new Set() });
      
      console.log(`Client connected: ${clientId}`);
      
      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleMessage(clientId, message);
        } catch (error) {
          console.error('Error handling message:', error);
          ws.send(JSON.stringify({ error: 'Invalid message format' }));
        }
      });
      
      ws.on('close', () => {
        this.handleDisconnect(clientId);
      });
      
      ws.on('error', (error) => {
        console.error(`Client ${clientId} error:`, error);
      });
      
      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        clientId,
        timestamp: Date.now()
      }));
    });
  }

  async handleMessage(clientId, message) {
    const { type, channel, data } = message;
    const client = this.clients.get(clientId);
    
    if (!client) return;
    
    switch (type) {
      case 'subscribe':
        if (this.channels[channel]) {
          this.channels[channel].add(clientId);
          client.channels.add(channel);
          
          // Send initial data
          await this.sendInitialData(clientId, channel);
          
          console.log(`Client ${clientId} subscribed to ${channel}`);
        }
        break;
        
      case 'unsubscribe':
        this.channels[channel]?.delete(clientId);
        client.channels.delete(channel);
        console.log(`Client ${clientId} unsubscribed from ${channel}`);
        break;
        
      case 'ping':
        client.ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        break;
        
      default:
        console.warn(`Unknown message type: ${type}`);
    }
  }

  broadcastToChannel(channel, data) {
    const clients = this.channels[channel];
    if (!clients) return;
    
    const message = JSON.stringify({
      type: 'update',
      channel,
      data,
      timestamp: Date.now()
    });
    
    clients.forEach(clientId => {
      const client = this.clients.get(clientId);
      if (client && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    });
  }

  async sendInitialData(clientId, channel) {
    const client = this.clients.get(clientId);
    if (!client) return;
    
    let data = {};
    
    switch (channel) {
      case 'investor-dashboard':
        data = await this.getInvestorDashboardData();
        break;
        
      case 'admin-dashboard':
        data = await this.getAdminDashboardData();
        break;
        
      case 'kpi-updates':
        data = await this.getKPIData();
        break;
        
      case 'alerts':
        data = await this.getActiveAlerts();
        break;
    }
    
    client.ws.send(JSON.stringify({
      type: 'initial',
      channel,
      data,
      timestamp: Date.now()
    }));
  }

  async getInvestorDashboardData() {
    // Mock data - in production, query database
    return {
      totalInvestment: 500000000000, // $500K
      totalOwnership: 25.0, // 25%
      totalROI: 125000000000, // $125K
      roiPercentage: 25.0, // 25%
      paybackPeriod: 12, // months
      restaurants: 5
    };
  }

  async getAdminDashboardData() {
    // Mock data - in production, query database
    return {
      totalRestaurants: 18,
      totalCountries: 5,
      totalRevenue: 500000000000, // $500K/month
      totalProfit: 75000000000, // $75K/month
      profitMargin: 15.0, // 15%
      totalCustomers: 50000,
      totalOrders: 10000,
      deliverySuccess: 98.0
    };
  }

  async getKPIData() {
    const revenue = await this.redisClient.get('kpi:revenue:total') || '0';
    const profit = await this.redisClient.get('kpi:profit:total') || '0';
    const margin = await this.redisClient.get('kpi:margin:average') || '0';
    const dividends = await this.redisClient.get('kpi:dividends:total') || '0';
    
    return {
      revenue: parseInt(revenue),
      profit: parseInt(profit),
      margin: parseFloat(margin),
      dividends: parseInt(dividends)
    };
  }

  async getActiveAlerts() {
    const alerts = [];
    const keys = await this.redisClient.keys('alerts:*');
    
    for (const key of keys) {
      const alert = await this.redisClient.hGetAll(key);
      if (alert) {
        alerts.push({ id: key.split(':')[1], ...alert });
      }
    }
    
    return alerts;
  }

  handleDisconnect(clientId) {
    const client = this.clients.get(clientId);
    if (!client) return;
    
    // Remove from all channels
    Object.keys(this.channels).forEach(channel => {
      this.channels[channel].delete(clientId);
    });
    
    this.clients.delete(clientId);
    console.log(`Client disconnected: ${clientId}`);
  }

  generateClientId() {
    return Math.random().toString(36).substr(2, 9);
  }

  async startKPIUpdates() {
    setInterval(async () => {
      try {
        // Simulate real-time KPI updates
        const kpiData = await this.getKPIData();
        
        // Add some random variation
        const variation = () => Math.random() * 0.02 - 0.01; // ±1%
        
        const updatedData = {
          revenue: Math.floor(kpiData.revenue * (1 + variation())),
          profit: Math.floor(kpiData.profit * (1 + variation())),
          margin: kpiData.margin + variation(),
          dividends: Math.floor(kpiData.dividends * (1 + variation()))
        };
        
        // Update Redis
        await this.redisClient.set('kpi:revenue:total', updatedData.revenue.toString());
        await this.redisClient.set('kpi:profit:total', updatedData.profit.toString());
        await this.redisClient.set('kpi:margin:average', updatedData.margin.toString());
        await this.redisClient.set('kpi:dividends:total', updatedData.dividends.toString());
        
        // Broadcast update
        this.broadcastToChannel('kpi-updates', updatedData);
        
      } catch (error) {
        console.error('KPI update error:', error);
      }
    }, 5000); // Update every 5 seconds
  }

  async startAlertsCheck() {
    setInterval(async () => {
      try {
        const alerts = await this.getActiveAlerts();
        
        if (alerts.length > 0) {
          this.broadcastToChannel('alerts', alerts);
          
          // Publish to Redis for persistence
          await this.redisClient.publish('nilelink:alerts', JSON.stringify(alerts));
        }
      } catch (error) {
        console.error('Alerts check error:', error);
      }
    }, 10000); // Check every 10 seconds
  }
}

// Initialize and start the server
const server = new NileLinkWebSocketServer();
server.initialize().catch(console.error);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down WebSocket server...');
  if (server.wss) {
    server.wss.close();
  }
  if (server.redisClient) {
    await server.redisClient.quit();
  }
  if (server.redisSubscriber) {
    await server.redisSubscriber.quit();
  }
  process.exit(0);
});