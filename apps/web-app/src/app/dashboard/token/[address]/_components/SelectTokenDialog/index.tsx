'use client';

import { ChevronDownIcon, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@acme/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@acme/ui/dialog';
import { Input } from '@acme/ui/input';
import { BaseCurrency } from '~/services/1inche/config';



interface SelectTokenDialogProps {
  options: BaseCurrency[];
  value: BaseCurrency | null;
  onChange: (token: BaseCurrency | null) => void;
  disabled?: boolean;
}

export const SelectTokenDialog = ({ options, value, onChange, disabled }: SelectTokenDialogProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTokens = useMemo(() => {
    if (!searchQuery.trim()) {
      return options;
    }

    const query = searchQuery.toLowerCase();
    return options.filter(
      (token) => token.name.toLowerCase().includes(query) || token.symbol.toLowerCase().includes(query) || token.address.toLowerCase().includes(query)
    );
  }, [searchQuery, options]);

  const handleSelectToken = (token: BaseCurrency) => {
    onChange(token);
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild disabled={disabled}>
        <Button variant="ghost">
          {value ? (
            <span className="flex items-center gap-2">
              <span className="font-semibold">{value.symbol}</span>
              <span className="text-muted-foreground text-sm">({value.name})</span>
            </span>
          ) : (
            'Select Token'
          )}

          <ChevronDownIcon className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select a Token</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, symbol, or address"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="max-h-[400px] overflow-y-auto space-y-1">
            {filteredTokens.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No tokens found</div>
            ) : (
              filteredTokens.map((token) => (
                <button
                  key={token.address}
                  onClick={() => handleSelectToken(token)}
                  className="w-full text-left px-4 py-3 rounded-md hover:bg-accent transition-colors flex items-center justify-between group"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold">{token.symbol}</span>
                    <span className="text-sm text-muted-foreground">{token.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono group-hover:text-foreground transition-colors">
                    {token.address.slice(0, 6)}...{token.address.slice(-4)}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
