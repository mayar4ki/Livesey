'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@acme/ui/card';
import { Calendar, Clock } from 'lucide-react';
import { type Proposal } from '~/services/proposal/useProposal';
import { type ProposalStatus } from '~/services/proposal/utils';
import { formatDate, formatRelativeTime, formatTimeRemaining } from './utils';

interface ProposalHeaderCardProps {
  proposal: Proposal;
  status: ProposalStatus;
}

export function ProposalHeaderCard({ proposal, status }: ProposalHeaderCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-2xl mb-2">{proposal.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Created {formatRelativeTime(proposal.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Ends: {formatTimeRemaining(proposal.expiresAt)}</span>
              </div>
            </div>
          </div>
          <span
            className={`text-xs px-3 py-1 rounded-full font-medium ${status === 'active'
                ? 'bg-blue-500/10 text-blue-500'
                : status === 'closed'
                  ? 'bg-gray-500/10 text-gray-500'
                  : 'bg-yellow-500/10 text-yellow-500'
              }`}
          >
            {status === 'active' ? 'Active' : status === 'closed' ? 'Closed' : 'Pending'}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Description</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{proposal.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Created At</p>
            <p className="text-sm font-medium">{formatDate(proposal.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Expires At</p>
            <p className="text-sm font-medium">{formatDate(proposal.expiresAt)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Block Number</p>
            <p className="text-sm font-medium font-mono">
              {typeof proposal.blockNumber === 'bigint' ? proposal.blockNumber.toString() : proposal.blockNumber}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Duration</p>
            <p className="text-sm font-medium">
              {Math.floor(proposal.duration / 86400)} days, {Math.floor((proposal.duration % 86400) / 3600)} hours
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

