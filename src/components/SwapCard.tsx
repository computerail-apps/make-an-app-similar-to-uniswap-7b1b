import { useState, useMemo, useCallback } from 'react';
import { useAppData } from '@/lib/data';
import { useWallet } from '@/lib/wallet';
import { Card, CardContent } from '@/lib/ui/Card';
import { Button } from '@/lib/ui/Button';
import { Badge } from '@/lib/ui/Badge';
import { Alert, AlertTitle, AlertDescription } from '@/lib/ui/Alert';
import { ArrowDown, Settings2, ChevronDown, Loader2 } from 'lucide-react';
import { TokenSelectModal, type Token, TOKENS } from '@/components/TokenSelectModal';
import { SlippageModal } from '@/components/SlippageModal';

interface QuoteResult {
  amountOut: string;
  priceImpactPct: number;
  gasEstimateUsd: number;
}

function useQuote(tokenIn: Token, tokenOut: Token, amountIn: string) {
  const mockAmountOut = useMemo(() => {
    const n = Number(amountIn || '0');
    if (!n) return '0';
    // Rough mock cross-rate based on mock USD prices, just for realistic display.
    const rate = tokenIn.mockUsdPrice / tokenOut.mockUsdPrice;
    return (n * rate).toFixed(tokenOut.decimals === 6 ? 2 : 6);
  }, [amountIn, tokenIn, tokenOut]);

  return useAppData<QuoteResult>({
    key: `quote-${tokenIn.symbol}-${tokenOut.symbol}-${amountIn}`,
    mock: {
      amountOut: mockAmountOut,
      priceImpactPct: 0.12,
      gasEstimateUsd: 4.32,
    },
    fetchLive: async () => { throw new Error('not wired yet'); },
  });
}

export function SwapCard({ onBrowseTokens }: { onBrowseTokens: () => void }) {
  const { isConnected, connect, isConnecting } = useWallet();
  const [tokenIn, setTokenIn] = useState<Token>(TOKENS[0]);
  const [tokenOut, setTokenOut] = useState<Token>(TOKENS[1]);
  const [amountIn, setAmountIn] = useState('1');
  const [slippageBps, setSlippageBps] = useState(50); // 0.5%
  const [pickerFor, setPickerFor] = useState<'in' | 'out' | null>(null);
  const [slippageOpen, setSlippageOpen] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null);
  const [lastTxHash] = useState<string | null>(null);

  const { data: quote, isLoading: quoteLoading, error: quoteError } = useQuote(tokenIn, tokenOut, amountIn);

  const mockBalanceIn = tokenIn.mockBalance;
  const insufficientBalance = Number(amountIn || '0') > mockBalanceIn;

  const handleFlip = useCallback(() => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
  }, [tokenIn, tokenOut]);

  const handleSelectToken = (t: Token) => {
    if (pickerFor === 'in') {
      if (t.symbol === tokenOut.symbol) setTokenOut(tokenIn);
      setTokenIn(t);
    } else if (pickerFor === 'out') {
      if (t.symbol === tokenIn.symbol) setTokenIn(tokenOut);
      setTokenOut(t);
    }
    setPickerFor(null);
  };

  const handleSwap = async () => {
    setSwapError(null);
    setIsSwapping(true);
    try {
      // Phase 2: build calldata for SwapRouter02.exactInputSingle, request
      // wallet signature via wagmi's sendTransaction, then await receipt.
      await new Promise((res) => setTimeout(res, 1200));
      throw new Error('Swap execution not wired yet — connect Phase 2 backend to submit real transactions.');
    } catch (e) {
      setSwapError((e as Error).message);
    } finally {
      setIsSwapping(false);
    }
  };

  let disabledReason: string | null = null;
  if (!isConnected) disabledReason = 'Connect wallet';
  else if (!amountIn || Number(amountIn) <= 0) disabledReason = 'Enter an amount';
  else if (insufficientBalance) disabledReason = `Insufficient ${tokenIn.symbol} balance`;

  return (
    <div className="w-full max-w-md space-y-3">
      <Card className="relative shadow-elev-2">
        <CardContent className="space-y-2 p-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-small text-muted-foreground">Swap</span>
            <button
              onClick={() => setSlippageOpen(true)}
              className="transition-colors"
              aria-label="Slippage settings"
            >
              <Badge variant="outline" className="cursor-pointer hover:bg-muted transition-colors">
                <Settings2 size={12} />
                {(slippageBps / 100).toFixed(2)}%
              </Badge>
            </button>
          </div>

          <TokenRow
            label="You pay"
            token={tokenIn}
            amount={amountIn}
            onAmountChange={setAmountIn}
            onPickToken={() => setPickerFor('in')}
            editable
            balance={mockBalanceIn}
          />

          <div className="relative flex justify-center py-1">
            <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
            <button
              onClick={handleFlip}
              className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-elevated shadow-elev-1 transition-transform duration-150 hover:scale-105 hover:bg-muted"
              aria-label="Flip tokens"
            >
              <ArrowDown size={16} className="text-foreground" />
            </button>
          </div>

          <TokenRow
            label="You receive"
            token={tokenOut}
            amount={quoteLoading ? '' : (quote?.amountOut ?? '0')}
            onPickToken={() => setPickerFor('out')}
            editable={false}
            loading={quoteLoading}
            balance={tokenOut.mockBalance}
          />

          {quoteError ? (
            <Alert variant="destructive" className="mt-2">
              <AlertTitle>Quote failed</AlertTitle>
              <AlertDescription>{(quoteError as Error).message}</AlertDescription>
            </Alert>
          ) : quote && Number(amountIn) > 0 && !quoteLoading ? (
            <div className="flex items-center justify-between px-1 pt-1 text-small text-muted-foreground">
              <span>
                1 {tokenIn.symbol} = {(tokenIn.mockUsdPrice / tokenOut.mockUsdPrice).toFixed(6)} {tokenOut.symbol}
              </span>
              <span className="tabular-nums">~${quote.gasEstimateUsd.toFixed(2)} gas</span>
            </div>
          ) : null}

          {swapError && (
            <Alert variant="destructive" className="mt-2">
              <AlertTitle>Swap failed</AlertTitle>
              <AlertDescription>{swapError}</AlertDescription>
            </Alert>
          )}

          {lastTxHash && (
            <Alert variant="success" className="mt-2">
              <AlertTitle>Swap submitted</AlertTitle>
              <AlertDescription className="font-mono">{lastTxHash}</AlertDescription>
            </Alert>
          )}

          <div className="pt-2">
            {disabledReason === 'Connect wallet' ? (
              <Button className="w-full" size="lg" onClick={connect} disabled={isConnecting}>
                {isConnecting ? <Loader2 size={16} className="animate-spin" /> : null}
                {isConnecting ? 'Connecting…' : 'Connect wallet'}
              </Button>
            ) : (
              <Button
                className="w-full"
                size="lg"
                disabled={!!disabledReason || isSwapping}
                onClick={handleSwap}
                variant={disabledReason ? 'secondary' : 'default'}
              >
                {isSwapping ? <Loader2 size={16} className="animate-spin" /> : null}
                {isSwapping ? 'Swapping…' : disabledReason ?? `Swap ${tokenIn.symbol} for ${tokenOut.symbol}`}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <button
          onClick={onBrowseTokens}
          className="text-small text-muted-foreground hover:text-foreground transition-colors"
        >
          Browse token prices →
        </button>
      </div>

      {pickerFor && (
        <TokenSelectModal
          onClose={() => setPickerFor(null)}
          onSelect={handleSelectToken}
          excludeSymbol={pickerFor === 'in' ? tokenOut.symbol : tokenIn.symbol}
        />
      )}
      {slippageOpen && (
        <SlippageModal
          value={slippageBps}
          onChange={setSlippageBps}
          onClose={() => setSlippageOpen(false)}
        />
      )}
    </div>
  );
}

function TokenRow({
  label,
  token,
  amount,
  onAmountChange,
  onPickToken,
  editable,
  loading,
  balance,
}: {
  label: string;
  token: Token;
  amount: string;
  onAmountChange?: (v: string) => void;
  onPickToken: () => void;
  editable: boolean;
  loading?: boolean;
  balance: number;
}) {
  const usdValue = Number(amount || '0') * token.mockUsdPrice;
  return (
    <div className="rounded-xl border border-border bg-surface p-3 transition-colors focus-within:border-primary">
      <div className="flex items-center justify-between text-small text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums">
          Balance: {balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-3">
        {editable ? (
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => onAmountChange?.(e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="0.0"
            className="w-full min-w-0 bg-transparent text-h2 tabular-nums text-foreground outline-none placeholder:text-muted-foreground"
          />
        ) : (
          <div className="w-full min-w-0 truncate text-h2 tabular-nums text-foreground">
            {loading ? <span className="skeleton inline-block h-7 w-24 rounded" /> : amount || '0'}
          </div>
        )}
        <button
          onClick={onPickToken}
          className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-surface-elevated px-3 py-1.5 transition-colors hover:bg-muted"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-micro font-medium uppercase text-muted-foreground">
            {token.symbol.slice(0, 1)}
          </span>
          <span className="text-body font-medium text-foreground">{token.symbol}</span>
          <ChevronDown size={14} className="text-muted-foreground" />
        </button>
      </div>
      <div className="mt-1 text-small tabular-nums text-muted-foreground">
        ${usdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </div>
    </div>
  );
}
