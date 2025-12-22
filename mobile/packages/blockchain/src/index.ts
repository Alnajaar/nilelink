export type WalletSession = {
  userPhoneE164: string;
  walletAddress: string;
};

export type PayRequest = {
  amountUsd6: bigint;
  to: string;
  tokenAddress: string;
  chainId: number;
};

export type PayResult = {
  txHash: string;
};

export type NileLinkWallet = {
  loginWithSms(phoneE164: string): Promise<WalletSession>;
  logout(): Promise<void>;
  getBalanceUsd6(tokenAddress: string): Promise<bigint>;
  pay(req: PayRequest): Promise<PayResult>;
};

// v0.1 placeholder. The concrete implementation will wrap Magic Wallet SDK + ethers.js.
export function createMagicWalletStub(): NileLinkWallet {
  return {
    async loginWithSms(phoneE164: string) {
      return { userPhoneE164: phoneE164, walletAddress: '0x0000000000000000000000000000000000000000' };
    },
    async logout() {
      return;
    },
    async getBalanceUsd6() {
      return 0n;
    },
    async pay() {
      return { txHash: '0x' + '0'.repeat(64) };
    }
  };
}
