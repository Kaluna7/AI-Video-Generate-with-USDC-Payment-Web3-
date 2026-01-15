'use client';

export default function GenerateConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  cost,
  isFree,
  isPaying = false,
  paymentError = '',
  treasuryAddress = '',
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-md shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6">
          {/* Icon */}
          <div className="w-16 h-16 gradient-purple-blue rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            Confirm Generation
          </h2>

          {/* Cost Display */}
          <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700 mb-6">
            {isFree ? (
              <div className="text-center">
                <div className="inline-block px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg mb-3">
                  <span className="text-green-400 font-semibold text-sm">FREE GENERATION</span>
                </div>
                <p className="text-3xl font-bold gradient-text mb-1">FREE</p>
                <p className="text-xs text-gray-400">Your first generation is on us!</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">Generation Cost</p>
                <p className="text-3xl font-bold gradient-text mb-1">{cost.toFixed(2)} USDC</p>
                <p className="text-xs text-gray-400">You&apos;ll pay on Arc testnet using USDC (native gas)</p>
                {treasuryAddress && (
                  <p className="mt-2 text-[11px] text-gray-500">
                    Recipient: <span className="text-gray-300 font-mono">{treasuryAddress}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {paymentError && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-300 text-sm">
              {paymentError}
            </div>
          )}

          {isPaying && (
            <div className="mb-6 bg-gray-800/30 rounded-lg p-4 border border-gray-700/60">
              <div className="flex items-center gap-3">
                <svg className="animate-spin w-5 h-5 text-purple-300" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <div className="min-w-0">
                  <p className="text-sm text-white font-medium">Waiting for wallet confirmation…</p>
                  <p className="text-xs text-gray-400">Approve the transaction in MetaMask</p>
                </div>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="bg-gray-800/30 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-gray-300">
                <p className="font-medium mb-1">What happens next?</p>
                <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
                  <li>Your video will be generated using AI</li>
                  <li>This process may take a few minutes</li>
                  <li>You&apos;ll be notified when it&apos;s ready</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isPaying}
              className="flex-1 py-3 px-4 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              No, Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isPaying}
              className="flex-1 py-3 px-4 gradient-purple-blue text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              {isPaying ? 'Paying…' : 'Yes, Generate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

