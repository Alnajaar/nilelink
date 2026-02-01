export const BLOCKCHAIN_CONFIG = {
    CHAIN_ID: 80002, // Polygon Amoy
    RPC_URL: 'https://polygon-amoy.g.alchemy.com/v2/cpZnu19BVqFOEeVPFwV8r',
    CONTRACT_ADDRESSES: {
        USDC: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
        ORDER_SETTLEMENT: '0x8c77a9d68AF2b6A520e3F399C120a05aC0Bec625',
    },
    ABIS: {
        ERC20: [
            "function allowance(address owner, address spender) view returns (uint256)",
            "function approve(address spender, uint256 amount) returns (bool)",
            "function balanceOf(address account) view returns (uint256)",
            "function decimals() view returns (uint8)"
        ],
        ORDER_SETTLEMENT: [
            "function createPaymentIntent(bytes16 orderId, address restaurant, address customer, uint256 amountUsd6, uint8 method) external",
            "function pay(bytes16 orderId, uint256 amountUsd6) external",
            "function settle(bytes16 orderId) external",
            "function getOrderStatus(bytes16 orderId) view returns (uint8 status, uint256 amount, uint64 paidAt, uint64 settledAt)",
            "event PaymentReceived(bytes16 indexed orderId, address indexed payer, address indexed restaurant, uint256 amountUsd6, uint256 protocolFee, uint8 method, uint64 timestamp)",
            "event PaymentSettled(bytes16 indexed orderId, address indexed restaurant, address indexed customer, uint256 grossUsd6, uint256 feeUsd6, uint256 netUsd6, bytes32 settlementProof, uint64 timestamp)"
        ]
    }
};
