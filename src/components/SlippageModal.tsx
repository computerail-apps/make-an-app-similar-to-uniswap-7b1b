import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/ui/Card';
import { Button } from '@/lib/ui/Button';
import { Input } from '@/lib/ui/Input';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

const PRESETS_BPS = [10, 50, 100];

export function SlippageModal({
  value,
  onChange,
  onClose,
}: {
  value: number;
  onChange: (bps: number) => void;
  onClose: () => void;
}) {
  const [custom, setCustom] = useState('');
  const isPreset = PRESETS_BPS.includes(value) && !custom;

  const applyCustom = (v: string) => {
    setCustom(v);
    const n = Number(v);
    if (v && !Number.isNaN(n) && n > 0) onChange(Math.round(n * 100));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in" onClick={onClose}>
      <Card className="w-full max-w-sm shadow-elev-4" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Slippage tolerance</CardTitle>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Close">
            <X size={18} />
          </button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {PRESETS_BPS.map((bps) => (
              <Button
                key={bps}
                variant={isPreset && value === bps ? 'default' : 'outline'}
                size="sm"
                onClick={() => { setCustom(''); onChange(bps); }}
              >
                {(bps / 100).toFixed(2)}%
              </Button>
            ))}
          </div>
          <div>
            <label className="mb-1 block text-small text-muted-foreground">Custom</label>
            <Input
              inputMode="decimal"
              placeholder="0.50"
              value={custom}
              onChange={(e) => applyCustom(e.target.value.replace(/[^0-9.]/g, ''))}
              className={cn(!isPreset && custom && 'border-primary')}
            />
          </div>
          {value > 500 && (
            <p className="text-small text-warning">High slippage tolerance — your trade may be frontrun.</p>
          )}
          <Button className="w-full" onClick={onClose}>Done</Button>
        </CardContent>
      </Card>
    </div>
  );
}
