'use client';

import { useState } from 'react';

export default function PricingPanel({ pricing, selectedLength, resolution, aiEnhancement, onPay }) {
  const [walletBalance] = useState(125.50);
  const transactions = [
    { type: 'Video Generated', amount: -5.00, time: '2 hours ago' },
    { type: 'Deposit', amount: 50.00, time: '1 day ago' },
    { type: 'Video Generated', amount: -12.00, time: '2 days ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Pricing Section */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Pricing</h2>
          <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
            Pay with USDC
          </button>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Video Length:</span>
            <span className="text-white">{selectedLength}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Resolution:</span>
            <span className="text-white">{resolution.includes('(') ? resolution.split(' ')[0] + ' HD' : resolution}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Style Processing:</span>
            <span className="text-white">+{pricing.styleProcessing} USDC</span>
          </div>
          {aiEnhancement && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">AI Enhancement:</span>
              <span className="text-white">+{pricing.aiEnhancement} USDC</span>
            </div>
          )}
          <div className="border-t border-gray-700 pt-3 mt-3">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Subtotal:</span>
              <span className="text-white">{pricing.subtotal.toFixed(2)} USDC</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Processing Fee:</span>
              <span className="text-white">{pricing.processingFee.toFixed(2)} USDC</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-700">
              <span className="text-white">Total:</span>
              <span className="gradient-text text-xl">{pricing.total.toFixed(2)} USDC</span>
            </div>
          </div>
        </div>

        <button
          onClick={onPay}
          className="w-full gradient-purple-blue text-white py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity mb-3"
        >
          Pay with USDC
        </button>
        <p className="text-xs text-gray-500 text-center">
          Secure payment powered by blockchain
        </p>
      </div>

      {/* About USDC Payment Section */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">About USDC Payment</h3>
        <ul className="space-y-3">
          {[
            'Instant payment confirmation',
            'Low transaction fees',
            'Secure blockchain transactions',
            'No chargebacks or reversals',
          ].map((benefit, index) => (
            <li key={index} className="flex items-center gap-3 text-sm text-gray-300">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      {/* Wallet Balance Section */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Wallet Balance</h3>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-1">Available USDC</p>
          <p className="text-3xl font-bold text-white">{walletBalance.toFixed(2)}</p>
        </div>
        <button className="w-full bg-gray-700 text-white py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors">
          + Add Funds
        </button>
      </div>

      {/* Recent Transactions Section */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {transactions.map((tx, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
              <div>
                <p className="text-sm text-white">{tx.type}</p>
                <p className="text-xs text-gray-500">{tx.time}</p>
              </div>
              <span className={`text-sm font-semibold ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

