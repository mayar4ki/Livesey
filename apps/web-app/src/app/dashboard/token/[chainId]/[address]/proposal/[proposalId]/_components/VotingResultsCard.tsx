'use client';

import { Button } from '@acme/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@acme/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectWallet } from '~/app/dashboard/_components/common/ConnectWallet';
import { useCreateVote } from '~/services/proposal/useCreateVote';
import { type Vote } from '~/services/proposal/useProposal';

interface VotingResultsCardProps {
  proposalId: string;
  votes: Vote[];
  isActive: boolean;
  userVote: Vote | null;
}

export function VotingResultsCard({ proposalId, votes, isActive, userVote }: VotingResultsCardProps) {
  const { isConnected } = useAccount();
  const createVoteMutation = useCreateVote();
  const [votingChoice, setVotingChoice] = useState<boolean | null>(null);

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

  const handleVote = async (choice: boolean) => {
    try {
      setVotingChoice(choice);
      await createVoteMutation.mutateAsync({
        proposalId,
        choice,
      });
      setVotingChoice(null);
    } catch (error) {
      console.error('Failed to vote:', error);
      setVotingChoice(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Voting Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">For</span>
              <span className="font-medium">
                {votesFor.toLocaleString()} votes ({forPercentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div className="bg-green-500 h-3 rounded-full transition-all" style={{ width: `${forPercentage}%` }}></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Against</span>
              <span className="font-medium">
                {votesAgainst.toLocaleString()} votes ({againstPercentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div className="bg-red-500 h-3 rounded-full transition-all" style={{ width: `${againstPercentage}%` }}></div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Votes</span>
            <span className="font-medium">{totalVotes.toLocaleString()}</span>
          </div>
        </div>

        {/* User's Vote */}
        {userVote && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
              {userVote.choice ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
              <div className="flex-1">
                <p className="text-sm font-medium">You voted {userVote.choice ? 'For' : 'Against'}</p>
                <p className="text-xs text-muted-foreground">
                  Voting Power:{' '}
                  {typeof userVote.votingPower === 'string' ? BigInt(userVote.votingPower).toString() : userVote.votingPower.toString()} VP
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Voting Section */}
        {isActive && !userVote && (
          <div className="pt-4 border-t">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Cast Your Vote</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Your voting power is determined by your token balance at the time the proposal was created.
                </p>
              </div>
              {isConnected ? (
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleVote(true)}
                    disabled={createVoteMutation.isPending || votingChoice !== null}
                    className="flex-1"
                    variant="outline"
                  >
                    {createVoteMutation.isPending && votingChoice === true ? (
                      <>Voting...</>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Vote For
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleVote(false)}
                    disabled={createVoteMutation.isPending || votingChoice !== null}
                    className="flex-1"
                    variant="outline"
                  >
                    {createVoteMutation.isPending && votingChoice === false ? (
                      <>Voting...</>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Vote Against
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground text-center">Connect your wallet to vote on this proposal</p>
                  <ConnectWallet />
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

