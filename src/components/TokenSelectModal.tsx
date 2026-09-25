import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/ui/Card';
import { Input } from '@/lib/ui/Input';
import { EmptyState } from '@/lib/ui/EmptyState';
import { Search, X } from 'lucide-react';

export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  mockUsdPrice: number;
  mockBalance: number;
}

export const TOKENS: Token[] = [
  { symbol: 'ETH', name: 'Ethereum', address: '0x0000000000000000000000000000000000000000', decimals: 18, mockUsdPrice: 3412.55, mockBalance: 2.4381 },
  { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6, mockUsdPrice: 1.0, mockBalance: 5230.12 },
  { symbol: 'USDT', name: 'Tether', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6, mockUsdPrice: 1.0, mockBalance: 1500.0 },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8, mockUsdPrice: 67842.12, mockBalance: 0.0821 },
  { symbol: 'UNI', name: 'Uniswap', address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', decimals: 18, mockUsdPrice: 7.84, mockBalance: 340.5 },
  { symbol: 'LINK', name: 'Chainlink', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', decimals: 18, mockUsdPrice: 14.29, mockBalance: 88.2 },
  { symbol: 'DAI', name: 'Dai', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18, mockUsdPrice: 1.0, mockBalance: 900.0 },
  { symbol: 'AAVE', name: 'Aave', address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', decimals: 18, mockUsdPrice: 92.16, mockBalance: 12.7 },
];

export function TokenSelectModal({
  onClose,
  onSelect,
  excludeSymbol,
}: {
  onClose: () => void;
  onSelect: (t: Token) => void;
  excludeSymbol: string;
}) {
  const [query, setQuery] = useState('');
  const filtered = TOKENS.filter(
    (t) =>
      t.symbol !== excludeSymbol &&
      (t.symbol.toLowerCase().includes(query.toLowerCase()) || t.name.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm animate-in md:items-center md:p-4"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-md shadow-elev-4 md:rounded-2xl rounded-t-2xl rounded-b-none max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Select a token</CardTitle>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Close">
            <X size={18} />
          </button>
        </CardHeader>
        <CardContent className="flex-1 space-y-3 overflow-y-auto">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name or symbol"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>
          {filtered.length === 0 ? (
            <EmptyState icon={<Search size={20} />} title="No tokens found" description="Try a different name or symbol." />
          ) : (
            <ul className="divide-y divide-border -mx-6">
              {filtered.map((t) => (
                <li key={t.symbol}>
                  <button
                    onClick={() => onSelect(t)}
                    className="flex w-full items-center gap-3 px-6 py-3 text-left transition-colors hover:bg-muted"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-micro font-medium uppercase text-muted-foreground">
                      {t.symbol.slice(0, 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-body text-foreground">{t.symbol}</div>
                      <div className="text-micro text-muted-foreground">{t.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-small tabular-nums text-foreground">{t.mockBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })}</div>
                      <div className="text-micro tabular-nums text-muted-foreground">${t.mockUsdPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
