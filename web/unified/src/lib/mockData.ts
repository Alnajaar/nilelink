import { LocationData } from '@/components/Map';

export const mockSmartNodes: LocationData[] = [
    {
        id: 'cairo-north-1',
        name: 'Cairo-North-1',
        latitude: 30.0444,
        longitude: 31.2357,
        load: '42%',
        color: '#0A2540' // primary
    },
    {
        id: 'dubai-main-2',
        name: 'Dubai-Main-2',
        latitude: 25.2048,
        longitude: 55.2708,
        load: '18%',
        color: '#00C389' // secondary
    },
    {
        id: 'london-edge-4',
        name: 'London-Edge-4',
        latitude: 51.5074,
        longitude: -0.1278,
        load: '65%',
        color: '#F5B301' // accent
    },
    {
        id: 'paris-node-1',
        name: 'Paris-Node-1',
        latitude: 48.8566,
        longitude: 2.3522,
        load: '31%',
        color: '#00C389' // success
    },
    // Additional nodes for a more global network
    {
        id: 'new-york-1',
        name: 'New York-1',
        latitude: 40.7128,
        longitude: -74.0060,
        load: '55%',
        color: '#F5B301' // warning
    },
    {
        id: 'tokyo-2',
        name: 'Tokyo-2',
        latitude: 35.6762,
        longitude: 139.6503,
        load: '28%',
        color: '#4A1C1C' // error
    },
    {
        id: 'sydney-3',
        name: 'Sydney-3',
        latitude: -33.8688,
        longitude: 151.2093,
        load: '37%',
        color: '#0A2540' // info
    },
    {
        id: 'mumbai-1',
        name: 'Mumbai-1',
        latitude: 19.0760,
        longitude: 72.8777,
        load: '49%',
        color: '#00C389' // secondary again
    }
];