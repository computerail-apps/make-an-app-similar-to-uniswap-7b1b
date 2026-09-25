import { useAppData } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/lib/ui/Card';
import { Badge } from '@/lib/ui/Badge';
import { CenteredSpinner } from '@/lib/ui/Spinner';
import { Alert, AlertTitle, AlertDescription } from '@/lib/ui/Alert';
import { EmptyState } from '@/lib/ui/EmptyState';
import { LineChart, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MarketToken {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
}

const MOCK_TOKENS: MarketToken[] = [
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 3412.55, price_change_percentage_24h: 2.31, market_cap: 410_500_000_000 },
  { id: 'usd-coin', symbol: 'usdc', name: 'USD Coin', current_price: 1.0, price_change_percentage_24h: 0.01, market_cap: 32_100_000_000 },
  { id: 'tether', symbol: 'usdt', name: 'Tether', current_price: 1.0, price_change_percentage_24h: -0.02, market_cap: 118_900_000_000 },
  { id: 'wrapped-bitcoin', symbol: 'wbtc', name: 'Wrapped Bitcoin', current_price: 67_842.12, price_change_percentage_24h: 1.12, market_cap: 10_200_000_000 },
  { id: 'uniswap', symbol: 'uni', name: 'Uniswap', current_price: 7.84, price_change_percentage_24h: -3.42, market_cap: 4_700_000_000 },
  { id: 'chainlink', symbol: 'link', name: 'Chainlink', current_price: 14.29, price_change_percentage_24h: 4.05, market_cap: 8_900_000_000 },
  { id: 'dai', symbol: 'dai', name: 'Dai', current_price: 1.0, price_change_percentage_24h: 0.0, market_cap: 5_300_000_000 },
  { id: 'aave', symbol: 'aave', name: 'Aave', current_price: 92.16, price_change_percentage_24h: -1.87, market_cap: 1_380_000_000 },
];

function formatCap(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toFixed(0)}`;
}

export function TokensPage() {
  const { data, isLoading, error } = useAppData<MarketToken[]>({
    key: 'tokens-market',
    mock: MOCK_TOKENS,
    fetchLive: async () => { throw new Error('not wired yet'); },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 text-foreground">Markets</h1>
        <p className="text-body text-muted-foreground mt-1">Live prices for major ERC-20 tokens, via CoinGecko.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Top tokens</CardTitle>
          <CardDescription>Price, 24h change, and market cap.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12"><CenteredSpinner label="Loading market data" /></div>
          ) : error ? (
            <div className="px-6 pb-6">
              <Alert variant="destructive">
                <AlertTitle>Couldn't load market data</AlertTitle>
                <AlertDescription>{(error as Error).message}</AlertDescription>
              </Alert>
            </div>
          ) : !data || data.length === 0 ? (
            <div className="px-6 pb-6">
              <EmptyState icon={<LineChart size={20} />} title="No token data" description="Market data will appear here once available." />
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {data.map((t) => (
                <li key={t.id} className="flex items-center gap-4 px-6 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-micro font-medium uppercase text-muted-foreground">
                    {t.symbol.slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-body text-foreground">{t.name}</div>
                    <div className="text-micro text-muted-foreground uppercase">{t.symbol}</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-body tabular-nums text-foreground">
                      ${t.current_price >= 1 ? t.current_price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : t.current_price.toFixed(4)}
                    </div>
                    <div className="text-micro text-muted-foreground tabular-nums">{formatCap(t.market_cap)} cap</div>
                  </div>
                  <Badge variant={t.price_change_percentage_24h >= 0 ? 'success' : 'destructive'} className="min-w-[72px] justify-center">
                    {t.price_change_percentage_24h >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {Math.abs(t.price_change_percentage_24h).toFixed(2)}%
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
