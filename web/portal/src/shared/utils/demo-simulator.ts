export const mockStats = {
  tps: 1247,
  merchants: 892,
  revenue: 23456789, // in cents
  blockHeight: 19204300
};

export function getSimulatedTPS(): number {
  // Simulate TPS between 1000-1500
  return Math.floor(Math.random() * 500) + 1000;
}

export function getSimulatedBlockHeight(): number {
  // Simulate block height increment
  return mockStats.blockHeight + Math.floor(Math.random() * 10);
}
