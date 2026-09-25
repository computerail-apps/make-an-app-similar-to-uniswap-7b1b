import { useState, useCallback } from 'react';

// Phase-1 mock wallet state. Phase 2 replaces this with real wagmi hooks
// (useAccount/useConnect/useDisconnect) against injected connectors.
interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number;
  connect: () => void;
  disconnect: () => void;
}

let globalAddress: string | null = null;
const listeners = new Set<() => void>();

function setGlobalAddress(addr: string | null) {
  globalAddress = addr;
  listeners.forEach((l) => l());
}

export function useWallet(): WalletState {
  const [, forceRender] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);

  useState(() => {
    const listener = () => forceRender((n) => n + 1);
    listeners.add(listener);
    return listener;
  });

  const connect = useCallback(() => {
    setIsConnecting(true);
    // Phase 2: trigger real wagmi connector + wallet_connectAsync flow.
    setTimeout(() => {
      setGlobalAddress('0x7a3F1c9E4B2d8A6f0C5e9D3b1A8f4E2c6D9B0a1F');
      setIsConnecting(false);
    }, 600);
  }, []);

  const disconnect = useCallback(() => {
    setGlobalAddress(null);
  }, []);

  return {
    address: globalAddress,
    isConnected: !!globalAddress,
    isConnecting,
    chainId: 1,
    connect,
    disconnect,
  };
}
