interface Window {
    ethereum?: {
        isMetaMask?: boolean;
        on?: (...args: any[]) => void;
        removeListener?: (...args: any[]) => void;
        autoRefreshOnNetworkChange?: boolean;
        request: (args: { method: string; params?: any[] }) => Promise<any>;
        [key: string]: any;
    };
}
