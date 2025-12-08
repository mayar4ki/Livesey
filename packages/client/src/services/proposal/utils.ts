import type { CreateProposalFormSchema } from '~/app/dashboard/token/[address]/_components/VotingTab/CreateProposalForm/createProposalFormSchema';

export type ProposalStatus = 'active' | 'closed' | 'pending';

/**
 * Converts days, hours, and minutes to total seconds
 * @param durationDays - Number of days
 * @param durationHours - Number of hours
 * @param durationMinutes - Number of minutes
 * @returns Total duration in seconds
 */
export function calculateDurationInSeconds(
  durationDays: number,
  durationHours: number,
  durationMinutes: number
): number {
  return durationDays * 24 * 60 * 60 + durationHours * 60 * 60 + durationMinutes * 60;
}

/**
 * Converts proposal form duration data to total seconds
 * @param data - Proposal form schema data
 * @returns Total duration in seconds
 */
export function proposalDurationToSeconds(data: CreateProposalFormSchema): number {
  return calculateDurationInSeconds(data.durationDays, data.durationHours, data.durationMinutes);
}

/**
 * Determines the status of a proposal based on its expiration date
 * @param expiresAt - The expiration date/time of the proposal
 * @returns 'active' if the proposal hasn't expired, 'closed' otherwise
 */
export function getProposalStatus(expiresAt: Date | string): ProposalStatus {
  const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  const now = new Date();
  return expiry.getTime() > now.getTime() ? 'active' : 'closed';
}
