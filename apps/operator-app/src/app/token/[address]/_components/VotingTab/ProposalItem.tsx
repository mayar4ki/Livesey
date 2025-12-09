'use client';

import { Vote } from '@acme/client/services/proposal/useProposal';
import { type ProposalStatus } from '@acme/client/services/proposal/utils';
import { Calendar, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useMemo } from 'react';

interface ProposalDisplay {
  id: string;
  title: string;
  description: string;
  endDate: string;
  status: ProposalStatus;
  votes: Vote[];
}

interface ProposalItemProps {
  proposal: ProposalDisplay;
}

function calculateVoteResults(votes: Vote[]) {
  const votesFor = votes
    .filter((v) => v.choice)
    .reduce((sum, v) => {
      const power = typeof v.votingPower === 'string' ? BigInt(v.votingPower) : v.votingPower;
      return sum + Number(power);
    }, 0);

  const votesAgainst = votes
    .filter((v) => !v.choice)
    .reduce((sum, v) => {
      const power = typeof v.votingPower === 'string' ? BigInt(v.votingPower) : v.votingPower;
      return sum + Number(power);
    }, 0);

  const totalVotes = votesFor + votesAgainst;
  const forPercentage = totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0;
  const againstPercentage = totalVotes > 0 ? (votesAgainst / totalVotes) * 100 : 0;

  return { votesFor, votesAgainst, totalVotes, forPercentage, againstPercentage };
}

export function ProposalItem({ proposal }: ProposalItemProps) {
  const { votesFor, votesAgainst, totalVotes, forPercentage, againstPercentage } = useMemo(
    () => calculateVoteResults(proposal.votes),
    [proposal.votes]
  );

  const isWinning = forPercentage > againstPercentage;
  const isTied = forPercentage === againstPercentage && totalVotes > 0;

  return (
    <div className="border rounded-lg p-5 space-y-4 bg-card">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-semibold text-base flex-1">{proposal.title}</h3>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              proposal.status === 'active'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : proposal.status === 'closed'
                  ? 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400'
                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
            }`}
          >
            {proposal.status === 'active' ? 'Active' : proposal.status === 'closed' ? 'Closed' : 'Pending'}
          </span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{proposal.description}</p>
      </div>

      {/* Voting Results */}
      <div className="space-y-3 pt-2">
        {/* Combined Progress Bar */}
        <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
          {totalVotes > 0 ? (
            <>
              <div className="absolute left-0 top-0 h-full bg-emerald-500 transition-all duration-300" style={{ width: `${forPercentage}%` }} />
              <div className="absolute right-0 top-0 h-full bg-rose-500 transition-all duration-300" style={{ width: `${againstPercentage}%` }} />
            </>
          ) : (
            <div className="absolute inset-0 bg-muted" />
          )}
        </div>

        {/* Vote Stats */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-muted-foreground">For</span>
            <span className="font-medium ml-1">{forPercentage.toFixed(0)}%</span>
          </div>

          {totalVotes > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              {proposal.status === 'closed' ? (
                isTied ? (
                  <span className="text-amber-500 font-medium">Tied</span>
                ) : isWinning ? (
                  <span className="text-emerald-500 font-medium">Passed</span>
                ) : (
                  <span className="text-rose-500 font-medium">Rejected</span>
                )
              ) : (
                <span>{totalVotes.toLocaleString()} votes</span>
              )}
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <span className="font-medium mr-1">{againstPercentage.toFixed(0)}%</span>
            <span className="text-muted-foreground">Against</span>
            <XCircle className="h-3.5 w-3.5 text-rose-500" />
          </div>
        </div>
      </div>

      {/* Footer with Date */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
        {proposal.status === 'active' ? (
          <>
            <Clock className="h-3.5 w-3.5" />
            <span>{proposal.endDate}</span>
          </>
        ) : (
          <>
            <Calendar className="h-3.5 w-3.5" />
            <span>{proposal.endDate}</span>
          </>
        )}
      </div>
    </div>
  );
}
