'use client';

import { Button } from '@acme/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acme/ui/card';
import { Input } from '@acme/ui/input';
import { Label } from '@acme/ui/label';
import { Plus, Vote, X } from 'lucide-react';
import { useState } from 'react';

type Proposal = {
  id: string;
  title: string;
  description: string;
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  endDate: string;
  status: 'active' | 'passed' | 'rejected';
};

// Mock data - replace with actual data
const mockProposals: Proposal[] = [
  {
    id: '1',
    title: 'Increase Token Supply',
    description: 'Proposal to increase the total supply by 10% to support ecosystem growth.',
    votesFor: 1250,
    votesAgainst: 450,
    totalVotes: 1700,
    endDate: '2 days left',
    status: 'active',
  },
  {
    id: '2',
    title: 'Update Tokenomics',
    description: 'Proposal to update the token distribution model and vesting schedule.',
    votesFor: 890,
    votesAgainst: 1200,
    totalVotes: 2090,
    endDate: 'Ended',
    status: 'rejected',
  },
];

export function VotingCard() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');
  const [votingDuration, setVotingDuration] = useState('');

  const handleCreateProposal = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic will be implemented later
    console.log('Creating proposal:', { proposalTitle, proposalDescription, votingDuration });
    // Reset form
    setProposalTitle('');
    setProposalDescription('');
    setVotingDuration('');
    setShowCreateForm(false);
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
                <Button type="submit" className="flex-1">
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
            {mockProposals.map((proposal) => {
              const forPercentage = proposal.totalVotes > 0 ? (proposal.votesFor / proposal.totalVotes) * 100 : 0;
              const againstPercentage = proposal.totalVotes > 0 ? (proposal.votesAgainst / proposal.totalVotes) * 100 : 0;

              return (
                <div key={proposal.id} className="border rounded-lg p-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold">{proposal.title}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          proposal.status === 'active'
                            ? 'bg-blue-500/10 text-blue-500'
                            : proposal.status === 'passed'
                              ? 'bg-green-500/10 text-green-500'
                              : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {proposal.status === 'active' ? 'Active' : proposal.status === 'passed' ? 'Passed' : 'Rejected'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{proposal.description}</p>
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

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-muted-foreground">Total Votes: {proposal.totalVotes.toLocaleString()}</span>
                    <div className="flex gap-2">
                      {proposal.status === 'active' && (
                        <>
                          <Button size="sm" variant="outline">
                            Vote For
                          </Button>
                          <Button size="sm" variant="outline">
                            Vote Against
                          </Button>
                        </>
                      )}
                      <span className="text-xs text-muted-foreground flex items-center">{proposal.endDate}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {mockProposals.length === 0 && <div className="text-center py-8 text-muted-foreground">No proposals available</div>}
        </CardContent>
      </Card>
    </div>
  );
}
