'use client';

import { Button } from '@acme/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acme/ui/card';
import { Plus, Vote, X } from 'lucide-react';
import { useState } from 'react';
import { CreateProposalDrawer } from './CreateProposalDrawer';
import { CreateProposalForm } from './CreateProposalForm/CreateProposalForm';

interface CreateProposalFormProps {
  deployedTokenId: string;
  onSuccess?: () => void;
}

export function CreateProposalCard({ deployedTokenId: tokenId, onSuccess }: CreateProposalFormProps) {
  const [showForm, setShowForm] = useState(false);

  return (
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

          <Button
            className=" hidden xl:flex "
            onClick={() => setShowForm(!showForm)}
            variant={showForm ? 'outline' : 'default'}
          >
            {showForm ? (
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

          <div className=" xl:hidden ">
            <CreateProposalDrawer tokenId={tokenId} onSuccess={onSuccess ?? (() => {})} />
          </div>
        </div>
      </CardHeader>

      {showForm && (
        <CardContent className="border-t pt-6 hidden xl:block ">
          <CreateProposalForm deployedTokenId={tokenId} onSuccess={onSuccess} />
        </CardContent>
      )}
    </Card>
  );
}
