import { Token } from '~/services/token/useTrendingTokens';
import { TokenBasicInfoCard } from './TokenBasicInfoCard';
import { TokenContractInfoCard } from './TokenContractInfoCard';
import { TokenDeploymentInfoCard } from './TokenDeploymentInfoCard';
import { TokenMetadataCard } from './TokenMetadataCard';

type OverviewTabProps = {
  token: Token;
  decimals: number | undefined;
  isLoadingDecimals: boolean;
};
export const OverviewTab = ({ token, decimals, isLoadingDecimals }: OverviewTabProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <TokenBasicInfoCard token={token} decimals={decimals} isLoadingDecimals={isLoadingDecimals} />
      <TokenContractInfoCard token={token} />
      <TokenDeploymentInfoCard token={token} />
      <TokenMetadataCard token={token} />
    </div>
  );
};
