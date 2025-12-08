'use client';

import { type Vote } from '@acme/client/services/proposal/useProposal';
import { Card, CardContent, CardHeader, CardTitle } from '@acme/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useAccount } from 'wagmi';
import { formatRelativeTime } from './utils';

interface AllVotesCardProps {
  votes: Vote[];
}

export function AllVotesCard({ votes }: AllVotesCardProps) {
  const { address: walletAddress } = useAccount();

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Votes ({votes.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {votes.length > 0 ? (
          <div className="space-y-2">
            {votes.map((vote) => {
              const isUserVote = walletAddress && vote.createdBy.toLowerCase() === walletAddress.toLowerCase();
              const votingPower =
                typeof vote.votingPower === 'string' ? BigInt(vote.votingPower) : vote.votingPower;
              const choiceText = vote.choice ? 'For' : 'Against';

              return (
                <div
                  key={vote.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isUserVote ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {vote.choice ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <div>
                      <p className={`text-sm ${isUserVote ? 'font-medium' : ''}`}>
                        {vote.createdBy.slice(0, 6)}...{vote.createdBy.slice(-4)}
                        {isUserVote && ' (You)'}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatRelativeTime(vote.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{choiceText}</span>
                    <span className="text-sm font-medium">{votingPower.toString()} VP</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">No votes yet</div>
        )}
      </CardContent>
    </Card>
  );
}
