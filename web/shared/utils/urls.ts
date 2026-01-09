/**
 * NileLink Application URLs Configuration
 * Handles environment-based URL selection for local dev vs production
 */

const IS_DEV = process.env.NODE_ENV === 'development';
const DOMAIN = 'nilelink.app';

export const APP_PORTS = {
    backend: 3010,
    customer: 3002,
    pos: 3003,
    delivery: 3004,
    supplier: 3005,
    portal: 3006,
    dashboard: 3007,
    unified: 3008,
};

export const getAppUrl = (app: keyof typeof APP_PORTS, subdomain?: string) => {
    if (IS_DEV) {
        const port = APP_PORTS[app];
        const host = subdomain ? `${subdomain}.${DOMAIN}` : DOMAIN;
        return `http://${host}:${port}`;
    }

    const host = subdomain ? `${subdomain}.${DOMAIN}` : DOMAIN;
    return `https://${host}`;
};

export const URLS = {
    portal: getAppUrl('portal'),
    pos: getAppUrl('pos'),
    delivery: getAppUrl('delivery'),
    customer: getAppUrl('customer'),
    supplier: getAppUrl('supplier'),
    dashboard: getAppUrl('dashboard'),
    unified: getAppUrl('unified'),
    api: IS_DEV ? 'http://localhost:3010/api' : 'https://api.nilelink.app/api',
    docs: IS_DEV ? `http://docs.${DOMAIN}:3010/api/docs` : `https://docs.${DOMAIN}`,
};
