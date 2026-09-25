import { SwapCard } from '@/components/SwapCard';

export function SwapPage({ onBrowseTokens }: { onBrowseTokens: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full max-w-md text-center space-y-2 animate-in">
        <h1 className="text-h1 text-foreground">Swap tokens</h1>
        <p className="text-body text-muted-foreground">
          Live quotes from Uniswap V3 on Ethereum mainnet. Connect a wallet to trade.
        </p>
      </div>
      <SwapCard onBrowseTokens={onBrowseTokens} />
    </div>
  );
}
