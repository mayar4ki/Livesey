'use client';

import { useQueryParams } from '@acme/client/hooks';
import { DataTablePagination } from '@acme/ui/bootstrapped/data-table-pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@acme/ui/card';
import { useMemo } from 'react';
import { Proposal } from '~/services/proposal/useProposal';
import { useProposals } from '~/services/proposal/useProposals';
import { getProposalStatus, type ProposalStatus } from '~/services/proposal/utils';
import { Token } from '~/services/token/useToken';
import { CreateProposalCard } from './CreateProposalCard';
import { ProposalItem } from './ProposalItem';

interface ProposalDisplay {
  id: string;
  title: string;
  description: string;
  endDate: string;
  status: ProposalStatus;
}

function formatTimeRemaining(expiresAt: Date | string): string {
  const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  const now = new Date();
  const diffMs = expiry.getTime() - now.getTime();

  if (diffMs <= 0) {
    return 'Expired';
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days} ${days === 1 ? 'day' : 'days'} left`;
  }
  if (hours > 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} left`;
  }
  return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} left`;
}

function transformProposal(proposal: Proposal): ProposalDisplay {
  return {
    id: proposal.id,
    title: proposal.title,
    description: proposal.description,
    endDate: formatTimeRemaining(proposal.expiresAt),
    status: getProposalStatus(proposal.expiresAt),
  };
}

export interface VotingTabProps {
  token: Token;
}

export function VotingTab({ token }: VotingTabProps) {
  const { params: queryParams, setParams } = useQueryParams({ take: 10, skip: 0 });

  const { data: proposalsResponse, isLoading: isLoadingProposals } = useProposals(token.id, {
    skip: queryParams.skip,
    take: queryParams.take,
  });

  const proposals = proposalsResponse?.data || [];

  const transformedProposals = useMemo(() => {
    return proposals.map(transformProposal);
  }, [proposals]);

  return (
    <div className="space-y-6">
      <CreateProposalCard deployedTokenId={token.id} />
      <Card>
        <CardHeader>
          <CardTitle>Proposals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoadingProposals ? (
            <div className="text-center py-8 text-muted-foreground">Loading proposals...</div>
          ) : (
            <>
              <div className="space-y-4">
                {transformedProposals.map((proposal) => (
                  <ProposalItem key={proposal.id} proposal={proposal} />
                ))}
              </div>

              {transformedProposals.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No proposals available</div>
              )}

              <DataTablePagination
                currentPage={Math.floor(queryParams.skip / queryParams.take) + 1}
                totalPages={
                  proposalsResponse?.pagination?.total
                    ? Math.ceil(proposalsResponse?.pagination?.total / proposalsResponse?.pagination?.take)
                    : 0
                }
                onPageChange={(page: number) => {
                  setParams({ skip: (page - 1) * queryParams.take, take: queryParams.take });
                }}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
