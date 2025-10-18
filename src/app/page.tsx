import { CompliantWithSection } from './components/CompliantWithSection';
import { FeaturesSection } from './components/FeaturesSection';
import { HeroSection } from './components/HeroSection/HeroSection';
import { StatsSection } from './components/StatsSection';

export default function Home() {
  return (
    <div className=" container pb-26 ">
      <HeroSection />
      <CompliantWithSection />
      <StatsSection />
      <FeaturesSection />
    </div>
  );
}
