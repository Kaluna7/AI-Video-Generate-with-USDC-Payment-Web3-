'use client';

export default function PricingPanel({ pricing, selectedLength, resolution, aiEnhancement, onPay }) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
      <button
        onClick={onPay}
        className="w-full gradient-purple-blue text-white py-4 rounded-lg font-semibold text-base hover:opacity-90 transition-opacity"
      >
        Pay with USDC
      </button>
    </div>
  );
}

