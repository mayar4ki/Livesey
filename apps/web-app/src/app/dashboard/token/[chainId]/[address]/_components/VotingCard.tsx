'use client';

import { Button } from '@acme/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acme/ui/card';
import { Input } from '@acme/ui/input';
import { Label } from '@acme/ui/label';
import { CheckCircle2, Plus, Vote, X, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectWallet } from '~/app/dashboard/_components/common/ConnectWallet';

type ProposalStatus = 'active' | 'closed' | 'pending';

interface ProposalDisplay {
  id: string;
  title: string;
  description: string;
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  endDate: string;
  status: ProposalStatus;
}

interface MockVote {
  id: string;
  voter: string;
  choice: number;
  vp: number;
}

// Mock data for demonstration
const mockProposals: ProposalDisplay[] = [
  {
    id: '1',
    title: 'Proposal to Increase Token Supply',
    description: 'This proposal aims to increase the total token supply by 10% to support ecosystem growth and development initiatives.',
    votesFor: 1250,
    votesAgainst: 450,
    totalVotes: 1700,
    endDate: '5 days left',
    status: 'active',
  },
  {
    id: '2',
    title: 'Governance Parameter Update',
    description: 'Update the minimum voting threshold from 5% to 3% to encourage more participation in governance decisions.',
    votesFor: 890,
    votesAgainst: 210,
    totalVotes: 1100,
    endDate: '2 days left',
    status: 'active',
  },
];

const mockVotes: Record<string, MockVote[]> = {
  '1': [
    { id: 'v1', voter: '0x1234567890123456789012345678901234567890', choice: 1, vp: 500 },
    { id: 'v2', voter: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', choice: 1, vp: 300 },
    { id: 'v3', voter: '0x9876543210987654321098765432109876543210', choice: 2, vp: 200 },
    { id: 'v4', voter: '0xfedcba9876543210fedcba9876543210fedcba98', choice: 1, vp: 250 },
  ],
  '2': [
    { id: 'v5', voter: '0x1111111111111111111111111111111111111111', choice: 1, vp: 400 },
    { id: 'v6', voter: '0x2222222222222222222222222222222222222222', choice: 1, vp: 300 },
    { id: 'v7', voter: '0x3333333333333333333333333333333333333333', choice: 2, vp: 150 },
  ],
};

interface ProposalItemProps {
  proposal: ProposalDisplay;
  isConnected: boolean;
  address: string | undefined;
}

function ProposalItem({ proposal, isConnected, address }: ProposalItemProps) {
  const votes = mockVotes[proposal.id] || [];
  const userVote = address ? votes.find((v) => v.voter.toLowerCase() === address.toLowerCase()) : null;

  const forPercentage = proposal.totalVotes > 0 ? (proposal.votesFor / proposal.totalVotes) * 100 : 0;
  const againstPercentage = proposal.totalVotes > 0 ? (proposal.votesAgainst / proposal.totalVotes) * 100 : 0;

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold">{proposal.title}</h3>
          <span
            className={`text-xs px-2 py-1 rounded ${
              proposal.status === 'active'
                ? 'bg-blue-500/10 text-blue-500'
                : proposal.status === 'closed'
                  ? 'bg-gray-500/10 text-gray-500'
                  : 'bg-yellow-500/10 text-yellow-500'
            }`}
          >
            {proposal.status === 'active' ? 'Active' : proposal.status === 'closed' ? 'Closed' : 'Pending'}
          </span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3">{proposal.description}</p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">For</span>
            <span className="font-medium">
              {proposal.votesFor.toLocaleString()} votes ({forPercentage.toFixed(1)}%)
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${forPercentage}%` }}></div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Against</span>
            <span className="font-medium">
              {proposal.votesAgainst.toLocaleString()} votes ({againstPercentage.toFixed(1)}%)
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-red-500 h-2 rounded-full transition-all" style={{ width: `${againstPercentage}%` }}></div>
          </div>
        </div>
      </div>

      {/* Show user's vote if they've voted */}
      {userVote && (
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md text-sm">
          {userVote.choice === 1 ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
          <span className="text-muted-foreground">
            You voted <span className="font-medium">{userVote.choice === 1 ? 'For' : 'Against'}</span> with {userVote.vp.toLocaleString()} voting
            power
          </span>
        </div>
      )}

      {/* Show recent votes */}
      {votes.length > 0 && (
        <div className="space-y-2 pt-2 border-t">
          <p className="text-xs font-medium text-muted-foreground">Recent Votes</p>
          <div className="space-y-1">
            {votes.slice(0, 5).map((vote) => {
              const choiceText = vote.choice === 1 ? 'For' : vote.choice === 2 ? 'Against' : `Choice ${vote.choice}`;
              const isUserVote = address && vote.voter.toLowerCase() === address.toLowerCase();

              return (
                <div
                  key={vote.id}
                  className={`flex items-center justify-between text-xs p-2 rounded ${isUserVote ? 'bg-primary/10' : 'bg-muted/30'}`}
                >
                  <div className="flex items-center gap-2">
                    {vote.choice === 1 ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                    <span className={isUserVote ? 'font-medium' : ''}>
                      {vote.voter.slice(0, 6)}...{vote.voter.slice(-4)}
                      {isUserVote && ' (You)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{choiceText}</span>
                    <span className="font-medium">{vote.vp.toLocaleString()} VP</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t">
        <span className="text-xs text-muted-foreground">Total Votes: {proposal.totalVotes.toLocaleString()}</span>
        <div className="flex gap-2 items-center">
          {proposal.status === 'active' && (
            <>
              {isConnected ? (
                <>
                  {!userVote ? (
                    <>
                      <Button size="sm" variant="outline">
                        Vote For
                      </Button>
                      <Button size="sm" variant="outline">
                        Vote Against
                      </Button>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">You have already voted</span>
                  )}
                </>
              ) : (
                <ConnectWallet />
              )}
            </>
          )}
          <span className="text-xs text-muted-foreground flex items-center">{proposal.endDate}</span>
        </div>
      </div>
    </div>
  );
}

export function VotingCard() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');
  const [votingDuration, setVotingDuration] = useState('');

  const { isConnected, address } = useAccount();

  const activeProposals = mockProposals.filter((p) => p.status === 'active');

  const handleCreateProposal = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic removed - design only
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Vote className="h-5 w-5" />
                Governance & Voting
              </CardTitle>
              <CardDescription>Participate in token governance and vote on proposals</CardDescription>
            </div>
            {isConnected ? (
              <Button onClick={() => setShowCreateForm(!showCreateForm)} variant={showCreateForm ? 'outline' : 'default'}>
                {showCreateForm ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Proposal
                  </>
                )}
              </Button>
            ) : (
              <ConnectWallet />
            )}
          </div>
        </CardHeader>

        {showCreateForm && (
          <CardContent className="border-t pt-6">
            <form onSubmit={handleCreateProposal} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="proposal-title">Proposal Title</Label>
                <Input
                  id="proposal-title"
                  placeholder="Enter proposal title"
                  value={proposalTitle}
                  onChange={(e) => setProposalTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proposal-description">Description</Label>
                <textarea
                  id="proposal-description"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Describe your proposal in detail..."
                  value={proposalDescription}
                  onChange={(e) => setProposalDescription(e.target.value)}
                  rows={5}
                  required
                />
                <p className="text-xs text-muted-foreground">Provide a detailed description of what this proposal aims to achieve</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="voting-duration">Voting Duration (days)</Label>
                <Input
                  id="voting-duration"
                  type="number"
                  placeholder="7"
                  min="1"
                  value={votingDuration}
                  onChange={(e) => setVotingDuration(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">How many days should the voting period last?</p>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={!isConnected}>
                  Create Proposal
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Proposals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {activeProposals.map((proposal) => (
              <ProposalItem key={proposal.id} proposal={proposal} isConnected={isConnected} address={address} />
            ))}
          </div>

          {activeProposals.length === 0 && <div className="text-center py-8 text-muted-foreground">No active proposals available</div>}
        </CardContent>
      </Card>
    </div>
  );
}
