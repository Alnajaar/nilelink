'use client';

import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Plus, Eye, EyeOff } from 'lucide-react';
import { PrimaryButton, Modal } from '@/components/ui';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'payment';
  amount: number;
  currency: 'LBP' | 'USD';
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export default function WalletPage() {
  const [showBalance, setShowBalance] = useState(true);
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const [selectedTopupMethod, setSelectedTopupMethod] = useState<string | null>(null);

  const balances = {
    lbp: 0,
    usd: 0.0,
  };

  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'deposit',
      amount: 100000,
      currency: 'LBP',
      description: 'Top-up via Card',
      date: '2025-01-15',
      status: 'completed',
    },
    {
      id: '2',
      type: 'payment',
      amount: 75000,
      currency: 'LBP',
      description: 'Order at Burger King',
      date: '2025-01-14',
      status: 'completed',
    },
  ];

  const topupMethods = [
    { id: 'card', name: 'Credit Card', icon: '💳' },
    { id: 'bank', name: 'Bank Transfer', icon: '🏦' },
    { id: 'wallet', name: 'E-wallet', icon: '📱' },
    { id: 'cash', name: 'Cash Deposit', icon: '💵' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-text-primary">Wallet</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* LBP Balance */}
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">LBP Balance</h3>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                {showBalance ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="mb-8">
              <p className="text-white/80 text-sm mb-2">Available Balance</p>
              <p className="text-4xl font-bold">
                {showBalance ? 'LBP ' + balances.lbp.toLocaleString() : '••••••'}
              </p>
            </div>

            <PrimaryButton
              variant="outline"
              fullWidth
              className="border-white text-white hover:bg-white/20"
              onClick={() => setIsTopupModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Top-up
            </PrimaryButton>
          </div>

          {/* USD Balance */}
          <div className="bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">USD Balance</h3>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                {showBalance ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="mb-8">
              <p className="text-white/80 text-sm mb-2">Available Balance</p>
              <p className="text-4xl font-bold">
                {showBalance ? 'USD ' + balances.usd.toFixed(2) : '••••••'}
              </p>
            </div>

            <PrimaryButton
              variant="outline"
              fullWidth
              className="border-white text-white hover:bg-white/20"
              onClick={() => setIsTopupModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Top-up
            </PrimaryButton>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-2xl p-6 shadow-elevation-1">
          <h2 className="text-xl font-bold text-text-primary mb-6">
            Transaction History
          </h2>

          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        ${
                          tx.type === 'deposit'
                            ? 'bg-success-100'
                            : 'bg-error-100'
                        }
                      `}
                    >
                      {tx.type === 'deposit' ? (
                        <ArrowDownLeft className="w-5 h-5 text-success-600" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-error-600" />
                      )}
                    </div>

                    <div>
                      <p className="font-semibold text-text-primary">
                        {tx.description}
                      </p>
                      <p className="text-sm text-text-tertiary">{tx.date}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`
                        font-bold text-lg
                        ${
                          tx.type === 'deposit'
                            ? 'text-success-600'
                            : 'text-text-primary'
                        }
                      `}
                    >
                      {tx.type === 'deposit' ? '+' : '-'}
                      {tx.amount.toLocaleString()} {tx.currency}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {tx.status === 'completed' && '✓ Completed'}
                      {tx.status === 'pending' && '⏳ Pending'}
                      {tx.status === 'failed' && '✗ Failed'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-text-secondary">No transactions yet</p>
            </div>
          )}
        </div>
      </main>

      {/* Top-up Modal */}
      <Modal
        isOpen={isTopupModalOpen}
        onClose={() => {
          setIsTopupModalOpen(false);
          setSelectedTopupMethod(null);
        }}
        title="Choose Top-up Method"
        size="sm"
      >
        <div className="grid grid-cols-2 gap-3">
          {topupMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedTopupMethod(method.id)}
              className={`
                p-4 rounded-xl border-2 transition-all duration-200 text-center
                ${
                  selectedTopupMethod === method.id
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              <div className="text-3xl mb-2">{method.icon}</div>
              <p className="font-semibold text-sm text-text-primary">
                {method.name}
              </p>
            </button>
          ))}
        </div>

        {selectedTopupMethod && (
          <div className="mt-6">
            <PrimaryButton fullWidth>
              Continue with {topupMethods.find(m => m.id === selectedTopupMethod)?.name}
            </PrimaryButton>
          </div>
        )}
      </Modal>
    </div>
  );
}
