'use client';

import { Button } from '@acme/ui/button';
import { toast } from '@acme/ui/sonner';
import { Copy } from 'lucide-react';

type CopyButtonProps = {
  textToCopy: string | (() => Promise<string> | string);
  successMessage?: string;
  errorMessage?: string;
  title?: string;
  variant?: 'ghost' | 'outline' | 'default' | 'destructive' | 'secondary' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
};

export function CopyButton({
  textToCopy,
  successMessage = 'Copied to clipboard',
  errorMessage = 'Failed to copy',
  title,
  variant = 'ghost',
  size = 'sm',
  className = 'h-8 w-8 p-0',
}: CopyButtonProps) {
  const handleCopy = async () => {
    try {
      const text = typeof textToCopy === 'function' ? await textToCopy() : textToCopy;
      await navigator.clipboard.writeText(text);
      toast.success(successMessage);
    } catch (err) {
      toast.error(errorMessage);
    }
  };

  return (
    <Button variant={variant} size={size} className={className} onClick={handleCopy} title={title}>
      <Copy className="h-4 w-4" />
      <span className="sr-only">{title || 'Copy'}</span>
    </Button>
  );
}
