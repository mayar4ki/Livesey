'use client';

import { LoadingCard } from '@acme/ui/bootstrapped/loading-card';
import { useFactoryInfo } from '~/services/factory/useFactoryInfo';
import { FactoryAboutCard } from './_components/FactoryAboutCard';
import { FactoryDetailsGrid } from './_components/FactoryDetailsGrid';
import { FactoryHeaderCard } from './_components/FactoryHeaderCard';
import { FactoryDangerZone } from './_components/factory-danger-zone';

export default function Page() {
  const { isLoading } = useFactoryInfo();

  if (isLoading) {
    return <LoadingCard message="Loading factory contract information..." />;
  }

  return (
    <div className="p-4 md:p-6 flex-1">
      <div className="space-y-6">
        <FactoryHeaderCard />

        <FactoryDetailsGrid />

        <FactoryAboutCard />

        <FactoryDangerZone />
      </div>
    </div>
  );
}
