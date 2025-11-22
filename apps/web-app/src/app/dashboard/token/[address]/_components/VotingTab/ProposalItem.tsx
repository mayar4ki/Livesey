'use client';

import { Calendar, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { type ProposalStatus } from '~/services/proposal/utils';

interface ProposalDisplay {
  id: string;
  title: string;
  description: string;
  endDate: string;
  status: ProposalStatus;
}

interface ProposalItemProps {
  proposal: ProposalDisplay;
}

export function ProposalItem({ proposal }: ProposalItemProps) {
  const params = useParams();
  const chainId = params.chainId as string;
  const tokenAddress = params.address as string;

  const proposalUrl = `/dashboard/token/${chainId}/${tokenAddress}/proposal/${proposal.id}`;

  return (
    <Link href={proposalUrl} className="block group">
      <div className="border rounded-lg p-4 space-y-4 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-semibold group-hover:text-primary transition-colors flex-1">{proposal.title}</h3>
            <div className="flex items-center gap-2 shrink-0">
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
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3">{proposal.description}</p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Ends: {proposal.endDate}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
