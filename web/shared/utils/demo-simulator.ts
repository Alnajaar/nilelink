export const mockStats = {
    revenue: 4210582,
    tps: 842.5,
    nodes: 1242,
    merchants: 894,
    users: 2847,
    orders: 18592,
    status: 'operational'
};

export function getSimulatedTPS(): number {
    return 842.5 + (Math.random() * 20) - 10;
}

export function getSimulatedBlockHeight(): number {
    return 19204300 + Math.floor(Math.random() * 100);
}

export function getSimulatedLatency(): number {
    return 1.2 + (Math.random() * 0.5);
}

export function getSimulatedNodeLoad(): string {
    const loads = ['15%', '28%', '42%', '65%', '78%', '92%'];
    return loads[Math.floor(Math.random() * loads.length)];
}
