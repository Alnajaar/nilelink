export interface SmartNodeLocation {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    status: 'online' | 'syncing' | 'maintenance';
    load: string;
    region: string;
}

export const globalSmartNodes: SmartNodeLocation[] = [
    {
        id: 'cairo-node-1',
        name: 'Cairo Central Hub',
        latitude: 30.0444,
        longitude: 31.2357,
        status: 'online',
        load: '42%',
        region: 'Middle East'
    },
    {
        id: 'dubai-node-1',
        name: 'Dubai Economic Node',
        latitude: 25.2048,
        longitude: 55.2708,
        status: 'online',
        load: '18%',
        region: 'Middle East'
    },
    {
        id: 'london-node-1',
        name: 'London Finance Gateway',
        latitude: 51.5074,
        longitude: -0.1278,
        status: 'online',
        load: '65%',
        region: 'Europe'
    },
    {
        id: 'nyc-node-1',
        name: 'New York Market Hub',
        latitude: 40.7128,
        longitude: -74.0060,
        status: 'syncing',
        load: '55%',
        region: 'North America'
    },
    {
        id: 'tokyo-node-1',
        name: 'Tokyo Tech Node',
        latitude: 35.6762,
        longitude: 139.6503,
        status: 'online',
        load: '28%',
        region: 'Asia'
    },
    {
        id: 'sydney-node-1',
        name: 'Sydney Edge Node',
        latitude: -33.8688,
        longitude: 151.2093,
        status: 'maintenance',
        load: '0%',
        region: 'Oceania'
    }
];
