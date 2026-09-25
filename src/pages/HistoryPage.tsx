import { useAppData } from '@/lib/data';
import { useWallet } from '@/lib/wallet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/lib/ui/Card';
import { Badge } from '@/lib/ui/Badge';
import { CenteredSpinner } from '@/lib/ui/Spinner';
import { Alert, AlertTitle, AlertDescription } from '@/lib/ui/Alert';
import { EmptyState } from '@/lib/ui/EmptyState';
import { Button } from '@/lib/ui/Button';
import { History, ExternalLink } from 'lucide-react';

interface SwapRecord {
  id: string;
  tx_hash: string;
  chain_id: number;
  token_in_symbol: string;
  token_out_symbol: string;
  amount_in: number;
  amount_out: number;
  status: 'pending' | 'confirmed' | 'failed';
  created_at: string;
}

const MOCK_HISTORY: SwapRecord[] = [
  { id: '1', tx_hash: '0x9f2a1c4e8b7d3a6f0c5e9d3b1a8f4e2c6d9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f', chain_id: 1, token_in_symbol: 'ETH', token_out_symbol: 'USDC', amount_in: 1.5, amount_out: 5118.83, status: 'confirmed', created_at: new Date(Date.now() - 3600_000).toISOString() },
  { id: '2', tx_hash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b', chain_id: 1, token_in_symbol: 'USDC', token_out_symbol: 'UNI', amount_in: 1200, amount_out: 153.06, status: 'confirmed', created_at: new Date(Date.now() - 86400_000).toISOString() },
  { id: '3', tx_hash: '0xdeadbeef1234567890abcdef1234567890abcdef1234567890abcdef123456', chain_id: 1, token_in_symbol: 'WBTC', token_out_symbol: 'ETH', amount_in: 0.05, amount_out: 0.993, status: 'pending', created_at: new Date(Date.now() - 300_000).toISOString() },
  { id: '4', tx_hash: '0xfeedface9876543210fedcba9876543210fedcba9876543210fedcba987654', chain_id: 1, token_in_symbol: 'DAI', token_out_symbol: 'LINK', amount_in: 500, amount_out: 34.99, status: 'failed', created_at: new Date(Date.now() - 172800_000).toISOString() },
];

const statusVariant: Record<SwapRecord['status'], 'success' | 'warning' | 'destructive'> = {
  confirmed: 'success',
  pending: 'warning',
  failed: 'destructive',
};

function relTime(iso: string): string {
  const s = Math.floor((Date.now() - Date.parse(iso)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function HistoryPage() {
  const { isConnected, connect } = useWallet();
  const { data, isLoading, error } = useAppData<SwapRecord[]>({
    key: 'swap-history',
    mock: MOCK_HISTORY,
    fetchLive: async () => { throw new Error('not wired yet'); },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 text-foreground">Swap history</h1>
        <p className="text-body text-muted-foreground mt-1">Your executed swaps, recorded per wallet.</p>
      </div>
      {!isConnected ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center gap-4">
            <EmptyState
              icon={<History size={20} />}
              title="Connect your wallet"
              description="Connect a wallet to view your personal swap history."
            />
            <Button onClick={connect} size="sm">Connect wallet</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent swaps</CardTitle>
            <CardDescription>Cross-checked against on-chain transaction status.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-12"><CenteredSpinner label="Loading history" /></div>
            ) : error ? (
              <div className="px-6 pb-6">
                <Alert variant="destructive">
                  <AlertTitle>Couldn't load history</AlertTitle>
                  <AlertDescription>{(error as Error).message}</AlertDescription>
                </Alert>
              </div>
            ) : !data || data.length === 0 ? (
              <div className="px-6 pb-6">
                <EmptyState icon={<History size={20} />} title="No swaps yet" description="Your executed swaps will show up here." />
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {data.map((h) => (
                  <li key={h.id} className="flex flex-col gap-2 px-6 py-4 md:flex-row md:items-center md:gap-4">
                    <Badge variant={statusVariant[h.status]}>{h.status}</Badge>
                    <div className="text-body tabular-nums text-foreground">
                      {h.amount_in.toLocaleString(undefined, { maximumFractionDigits: 4 })} {h.token_in_symbol}
                      <span className="text-muted-foreground mx-2">→</span>
                      {h.amount_out.toLocaleString(undefined, { maximumFractionDigits: 4 })} {h.token_out_symbol}
                    </div>
                    <a
                      href={`https://etherscan.io/tx/${h.tx_hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-small font-mono text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {h.tx_hash.slice(0, 8)}…{h.tx_hash.slice(-6)}
                      <ExternalLink size={12} />
                    </a>
                    <span className="ml-auto text-small text-muted-foreground">{relTime(h.created_at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
