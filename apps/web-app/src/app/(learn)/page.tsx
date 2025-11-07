import { CompliantWithSection } from './_components/CompliantWithSection';
import { FeaturesSection } from './_components/FeaturesSection';
import { HeroSection } from './_components/HeroSection/HeroSection';
import { StatsSection } from './_components/StatsSection';

export default function Home() {
  return (
    <div className=" pb-26">
      <HeroSection />
      <CompliantWithSection />
      <StatsSection />
      <FeaturesSection />
    </div>
  );
}
