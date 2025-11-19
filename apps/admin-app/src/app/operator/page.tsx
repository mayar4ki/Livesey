'use client';

import { formatAddress, getChainUIName } from '@acme/client/utils';
import { Badge } from '@acme/ui/badge';
import { ExplorerLink } from '@acme/ui/bootstrapped/explorer-address-link';
import { LoadingCard } from '@acme/ui/bootstrapped/loading-card';
import { Button } from '@acme/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@acme/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@acme/ui/table';
import { Plus, Users } from 'lucide-react';
import Link from 'next/link';
import { useChainId } from 'wagmi';
import { useOperators } from '~/services/factory/useOperators';

export default function Page() {
  const chainId = useChainId();
  const { operators, totalCount, isLoading } = useOperators();

  if (isLoading) {
    return <LoadingCard message="Loading operators..." />;
  }

  return (
    <div className="p-4 md:p-6 flex-1">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Operators</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {totalCount} {totalCount === 1 ? 'operator' : 'operators'} registered
              </p>
            </div>
            <Button asChild>
              <Link href="/operator/create">
                <Plus className="h-4 w-4 mr-2" />
                Add Operator
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {operators.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Operators Found</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">No operators have been registered in the Factory contract yet.</p>
              <Button asChild>
                <Link href="/operator/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Operator
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Operator</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Chain</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operators.map((operator, index) => (
                  <TableRow key={`${operator.operator}-${index}`}>
                    <TableCell>
                      <Link href={`/operator/${operator.operator}`} className="font-medium hover:underline cursor-pointer font-mono ">
                        {formatAddress(operator.operator)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <ExplorerLink hash={operator.operator} chainId={chainId} showFull />
                    </TableCell>

                    <TableCell>
                      <Badge variant="secondary">{getChainUIName(chainId)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={operator.isPaused ? 'destructive' : 'default'}>{operator.isPaused ? 'Paused' : 'Active'}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
