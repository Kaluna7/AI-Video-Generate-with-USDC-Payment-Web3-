'use client';

import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useAuthStore } from '../../../store/authStore';
import { claimTopUp, getCoinBalance } from '../../../lib/api';
import { sendArcNativeUsdcPayment, waitForTxReceipt } from '../../../lib/arc';

const COIN_ICON_SRC = '/assets/images/coin-3d.svg';

export default function TopUpModal() {
  const isOpen = useAuthStore((s) => s.isTopUpModalOpen);
  const closeTopUpModal = useAuthStore((s) => s.closeTopUpModal);
  const walletAddress = useAuthStore((s) => s.walletAddress);
  const setCoinBalance = useAuthStore((s) => s.setCoinBalance);

  const [amount, setAmount] = useState('1.00'); // USDC
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');

  const treasury = process.env.NEXT_PUBLIC_ARC_TREASURY_ADDRESS || '';
  const coinsPerUsdc = 100;

  const claimWithTxHash = async (hash) => {
    await claimTopUp({ tx_hash: hash });
    const bal = await getCoinBalance();
    if (bal && typeof bal.coins === 'number') setCoinBalance(bal.coins);
  };

  const coinsPreview = useMemo(() => {
    const n = Number.parseFloat(amount);
    if (Number.isNaN(n) || n <= 0) return 0;
    return Math.floor(n * coinsPerUsdc);
  }, [amount]);

  if (!isOpen) return null;

  const content = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !isLoading && closeTopUpModal()} />

      <div className="relative bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-md shadow-2xl z-[10000]">
        <button
          onClick={() => !isLoading && closeTopUpModal()}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Image src={COIN_ICON_SRC} alt="Coin" width={40} height={40} />
            <div>
              <h2 className="text-xl font-bold text-white">Top Up Coins</h2>
              <p className="text-xs text-gray-400">Send USDC on Arc testnet and get coins instantly.</p>
            </div>
          </div>

          {!walletAddress && (
            <div className="mb-4 p-3 bg-yellow-500/15 border border-yellow-500/30 rounded-lg text-yellow-200 text-sm">
              Please connect your wallet first.
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700">
            <label className="block text-xs text-gray-400 mb-2">Top up amount (USDC)</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              placeholder="e.g. 1.00"
              inputMode="decimal"
              disabled={isLoading}
            />
            <p className="mt-2 text-xs text-gray-400">
              You will receive approximately <span className="text-white font-semibold">{coinsPreview}</span> coins
              <span className="text-gray-500"> (rate: {coinsPerUsdc} coins / 1 USDC)</span>
            </p>
          </div>

          {txHash && (
            <div className="mt-4">
              <div className="p-3 bg-gray-800/40 border border-gray-700 rounded-lg text-xs text-gray-300 font-mono break-all">
                Tx: {txHash}
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-xs text-gray-400">
                  If your transfer succeeded but coins didn&apos;t update, click <span className="text-white">Claim coins</span>.
                </p>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={async () => {
                    setError('');
                    if (!txHash) return;
                    setIsLoading(true);
                    try {
                      await claimWithTxHash(txHash);
                      closeTopUpModal();
                    } catch (e) {
                      const msg = e?.message || 'Claim failed';
                      if (String(msg).includes('ARC_TREASURY_ADDRESS is not set')) {
                        setError('Backend is missing ARC_TREASURY_ADDRESS. Add it to back-end/.env and restart backend, then click Claim coins again.');
                      } else {
                        setError(msg);
                      }
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="shrink-0 px-3 py-2 rounded-lg bg-gray-700 text-white text-xs font-semibold hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Claiming…' : 'Claim coins'}
                </button>
              </div>
            </div>
          )}

          <div className="mt-5 flex gap-3">
            <button
              onClick={() => !isLoading && closeTopUpModal()}
              disabled={isLoading}
              className="flex-1 py-3 px-4 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              disabled={isLoading || !walletAddress}
              onClick={async () => {
                setError('');
                setTxHash('');
                if (!treasury) {
                  setError(
                    'Treasury address not configured. Add NEXT_PUBLIC_ARC_TREASURY_ADDRESS to front-end/.env.local (no quotes) and restart `pnpm dev`.'
                  );
                  return;
                }
                const n = Number.parseFloat(amount);
                if (Number.isNaN(n) || n <= 0) {
                  setError('Enter a valid amount.');
                  return;
                }

                setIsLoading(true);
                try {
                  const hash = await sendArcNativeUsdcPayment({
                    from: walletAddress,
                    to: treasury,
                    amountUsdc: n.toFixed(2),
                  });
                  setTxHash(hash);
                  const receipt = await waitForTxReceipt(hash, { timeoutMs: 180000, pollMs: 2000 });
                  if (!receipt || receipt.status !== '0x1') throw new Error('Transaction failed');

                  await claimWithTxHash(hash);

                  closeTopUpModal();
                } catch (e) {
                  const msg = e?.message || 'Top up failed';
                  if (String(msg).includes('ARC_TREASURY_ADDRESS is not set')) {
                    setError('Backend is missing ARC_TREASURY_ADDRESS. Add it to back-end/.env and restart backend, then click Claim coins.');
                  } else {
                    setError(msg);
                  }
                } finally {
                  setIsLoading(false);
                }
              }}
              className="flex-1 py-3 px-4 gradient-purple-blue text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing…' : 'Top Up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof window !== 'undefined') return createPortal(content, document.body);
  return content;
}


