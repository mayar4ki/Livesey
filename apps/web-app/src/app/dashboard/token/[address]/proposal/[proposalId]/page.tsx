'use client';

import { useProposal } from '@acme/client/services/proposal/useProposal';
import { getProposalStatus } from '@acme/client/services/proposal/utils';
import { ErrorStateCard } from '@acme/ui/bootstrapped/error-state-card';
import { LoadingCard } from '@acme/ui/bootstrapped/loading-card';
import { ArrowLeft, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import { AllVotesCard } from './_components/AllVotesCard';
import { ProposalHeaderCard } from './_components/ProposalHeaderCard';
import { VotingResultsCard } from './_components/VotingResultsCard';

export default function ProposalPage() {
  const params = useParams();
  const tokenAddress = params.address as string;
  const proposalId = params.proposalId as string;
  const { address: walletAddress } = useAccount();

  const { data: proposalResponse, isLoading, error } = useProposal(proposalId);
  const proposal = proposalResponse?.data;

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <LoadingCard message="Loading proposal..." />
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <ErrorStateCard
          icon={XCircle}
          title="Proposal Not Found"
          message={error instanceof Error ? error.message : 'Failed to load proposal information'}
        />
      </div>
    );
  }

  const votes = proposal.votes || [];
  const status = getProposalStatus(proposal.expiresAt);
  const userVote = walletAddress
    ? (votes.find((v) => v.createdBy.toLowerCase() === walletAddress.toLowerCase()) ?? null)
    : null;
  const isActive = status === 'active';

  const backUrl = `/dashboard/token/${tokenAddress}`;

  return (
    <div className="p-4 md:p-6 flex-1 max-w-4xl mx-auto">
      <div className="space-y-6">
        {/* Back Button */}
        <Link
          href={backUrl}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Proposals
        </Link>

        {/* Proposal Header */}
        <ProposalHeaderCard proposal={proposal} status={status} />

        {/* Voting Results */}
        <VotingResultsCard proposalId={proposal.id} votes={votes} isActive={isActive} userVote={userVote} />

        {/* All Votes */}
        <AllVotesCard votes={votes} />
      </div>
    </div>
  );
}
