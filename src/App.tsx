import { useState } from 'react';
import { Nav, NavLink } from '@/lib/ui/Nav';
import { Container } from '@/lib/ui/Container';
import { Button } from '@/lib/ui/Button';
import { Wallet, ArrowLeftRight, LineChart, History } from 'lucide-react';
import { SwapPage } from '@/pages/SwapPage';
import { TokensPage } from '@/pages/TokensPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { useWallet } from '@/lib/wallet';

type Route = 'swap' | 'tokens' | 'history';

export default function App() {
  const [route, setRoute] = useState<Route>('swap');
  const { address, isConnected, connect, disconnect, isConnecting } = useWallet();

  return (
    <div className="min-h-screen">
      <Nav
        brand={<span className="tracking-tight">Ripple</span>}
        actions={
          isConnected ? (
            <Button variant="outline" size="sm" onClick={disconnect}>
              <Wallet size={16} />
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected'}
            </Button>
          ) : (
            <Button size="sm" onClick={connect} disabled={isConnecting}>
              <Wallet size={16} />
              {isConnecting ? 'Connecting…' : 'Connect wallet'}
            </Button>
          )
        }
      >
        <NavLink href="#" active={route === 'swap'} onClick={() => setRoute('swap')}>
          <ArrowLeftRight size={14} className="mr-2" />Swap
        </NavLink>
        <NavLink href="#" active={route === 'tokens'} onClick={() => setRoute('tokens')}>
          <LineChart size={14} className="mr-2" />Tokens
        </NavLink>
        <NavLink href="#" active={route === 'history'} onClick={() => setRoute('history')}>
          <History size={14} className="mr-2" />History
        </NavLink>
      </Nav>
      <main className="py-8 md:py-12">
        <Container>
          {route === 'swap' && <SwapPage onBrowseTokens={() => setRoute('tokens')} />}
          {route === 'tokens' && <TokensPage />}
          {route === 'history' && <HistoryPage />}
        </Container>
      </main>
    </div>
  );
}
