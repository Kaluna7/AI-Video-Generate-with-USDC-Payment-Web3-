'use client';

export const ARC_TESTNET = {
  chainIdHex: '0x4cef52', // 5042002
  chainName: 'Arc Testnet',
  rpcUrls: ['https://rpc.testnet.arc.network'],
  blockExplorerUrls: ['https://testnet.arcscan.app'],
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 6 },
};

const toHex = (n) => {
  const b = typeof n === 'bigint' ? n : BigInt(n);
  return `0x${b.toString(16)}`;
};

export const ensureArcTestnet = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not found');
  }
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: ARC_TESTNET.chainIdHex }],
    });
  } catch (e) {
    if (e?.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: ARC_TESTNET.chainIdHex,
            chainName: ARC_TESTNET.chainName,
            rpcUrls: ARC_TESTNET.rpcUrls,
            blockExplorerUrls: ARC_TESTNET.blockExplorerUrls,
            nativeCurrency: ARC_TESTNET.nativeCurrency,
          },
        ],
      });
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ARC_TESTNET.chainIdHex }],
      });
    } else {
      throw e;
    }
  }
};

export const usdcToBaseUnits = (amountUsdc) => {
  // Convert decimal USDC -> integer base units (6 decimals) safely
  const s = String(amountUsdc ?? '').trim();
  if (!s) return 0n;
  const [wholeRaw, fracRaw = ''] = s.split('.');
  const whole = BigInt(wholeRaw || '0');
  const frac = fracRaw.padEnd(6, '0').slice(0, 6);
  return whole * 1000000n + BigInt(frac || '0');
};

export const sendArcNativeUsdcPayment = async ({ from, to, amountUsdc }) => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not found');
  }
  if (!from) throw new Error('Missing from address');
  if (!to) throw new Error('Missing recipient address');

  await ensureArcTestnet();

  const value = usdcToBaseUnits(amountUsdc);
  if (value <= 0n) throw new Error('Invalid amount');

  const txHash = await window.ethereum.request({
    method: 'eth_sendTransaction',
    params: [
      {
        from,
        to,
        value: toHex(value),
      },
    ],
  });
  return txHash;
};

export const waitForTxReceipt = async (txHash, { timeoutMs = 120000, pollMs = 2000 } = {}) => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not found');
  }
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const receipt = await window.ethereum.request({
      method: 'eth_getTransactionReceipt',
      params: [txHash],
    });
    if (receipt) return receipt;
    await new Promise((r) => setTimeout(r, pollMs));
  }
  throw new Error('Transaction confirmation timed out');
};


