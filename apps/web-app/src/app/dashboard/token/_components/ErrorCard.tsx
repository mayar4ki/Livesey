'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

type ErrorCardProps = {
  error: {
    message: string;
    type: 'transaction' | 'verification';
  };
  onReset: () => void;
};

export function ErrorCard({ error, onReset }: ErrorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            {error.type === 'transaction' ? 'Transaction Error' : 'Verification Error'}
          </CardTitle>
          <CardDescription>
            {error.type === 'transaction' ? 'The transaction failed to complete successfully' : 'The verification process failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-destructive/10 p-4">
            <p className="text-sm text-destructive font-medium">{error.message}</p>
          </div>
          <Button onClick={onReset} variant="default" className="w-full sm:w-auto">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset & Try Again
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
