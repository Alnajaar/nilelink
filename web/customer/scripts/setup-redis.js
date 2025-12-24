const redis = require('redis');

const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => console.error('Redis Client Error', err));

async function setupRedis() {
  try {
    await client.connect();
    console.log('Connected to Redis');
    
    // Set up Redis data structures
    console.log('Setting up Redis structures...');
    
    // Initialize KPI cache
    await client.set('kpi:revenue:total', '500000000000'); // $500K total revenue
    await client.set('kpi:profit:total', '125000000000');  // $125K total profit
    await client.set('kpi:margin:average', '18.5');        // 18.5% average margin
    await client.set('kpi:dividends:total', '12500000000'); // $12.5K total dividends
    
    // Set up alert cache
    await client.hSet('alerts:1', {
      type: 'margin',
      severity: 'warning',
      message: 'Profit margin below 15% target',
      restaurant: 'Beirut Bistro',
      timestamp: Date.now().toString()
    });
    
    await client.hSet('alerts:2', {
      type: 'revenue',
      severity: 'critical',
      message: 'Revenue target missed for 2+ weeks',
      restaurant: 'Tripoli Tavern',
      timestamp: Date.now().toString()
    });
    
    // Set up WebSocket channel subscriptions
    await client.publish('nilelink:updates', JSON.stringify({
      type: 'system',
      message: 'Redis setup completed',
      timestamp: Date.now()
    }));
    
    console.log('✅ Redis setup completed!');
    
  } catch (error) {
    console.error('❌ Redis setup failed:', error);
  } finally {
    await client.quit();
  }
}

setupRedis().catch(console.error);