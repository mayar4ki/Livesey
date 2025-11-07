import { cn } from '@acme/ui';
import { compliantWithSection } from '@acme/white-label/web-app';
import { LightRays } from '~/_components/ui/light-rays';

export const CompliantWithSection = () => {
  return (
    <section className="py-32 relative  ">
      <LightRays className={cn(' absolute top-0 bottom-0 right-0 left-0  ', '[mask-image:linear-gradient(to_top,transparent,black,transparent)]')} />

      <div className="container">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-3xl font-bold">{compliantWithSection.title}</h2>
          <p className="text-muted-foreground mt-1">{compliantWithSection.subtitle}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-6 lg:gap-12">
            {compliantWithSection.logos.map((logo, index) => (
              <img key={index} src={logo.logo} alt={`${logo.name} logo`} width={109} height={48} className={logo.className} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
