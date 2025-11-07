import {
  BookCheck,
  ChartPie,
  FolderSync,
  Goal,
  Users,
  Zap,
} from "lucide-react";

export const badge = "✨ Tokenize your assets";
export const heading = "Real-world Assets Tokenization";
export const description =
  "Enhance liquidity, Transform how you manage assets today, focusing on transparency and decentralization.";
export const buttons = {
  primary: {
    text: "Discover Smart Contracts",
    url: "/",
  },
};

export type FeaturesSection = {
  title: string;
  features: {
    icon: any;
    title: string;
    description: string;
  }[];
};
export const featuresSection: FeaturesSection = {
  title: "Features that Empower Your Strategy",
  features: [
    {
      icon: Goal,
      title: "Identify Opportunities",
      description:
        "Easily uncover untapped areas to explore and expand your reach effortlessly and effectively.",
    },
    {
      icon: BookCheck,
      title: "Build Authority",
      description:
        "Create valuable content that resonates, inspires trust, and positions you as an expert.",
    },
    {
      icon: ChartPie,
      title: "Instant Insights",
      description:
        "Gain immediate, actionable insights with a quick glance, enabling fast decision-making.",
    },
    {
      icon: Users,
      title: "Engage with Your Audience",
      description:
        "Boost audience engagement with interactive features like polls, quizzes, and forms.",
    },
    {
      icon: FolderSync,
      title: "Automate Your Workflow",
      description:
        "Streamline your processes by automating repetitive tasks, saving time and reducing effort.",
    },
    {
      icon: Zap,
      title: "Accelerate Growth",
      description:
        "Supercharge your growth by implementing strategies that drive results quickly and efficiently.",
    },
  ],
};

export const compliantWithSection = {
  title: "Our smart contracts are compliant with governments regulations",
  subtitle: "compliant with the following laws and regulations",
  logos: [
    {
      name: "Vercel",
      logo: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/vercel-wordmark.svg",
      className: "h-7 w-auto",
    },
    {
      name: "Astro",
      logo: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/tailwind-wordmark.svg",
      className: "h-5 w-auto",
    },
    {
      name: "Supabase",
      logo: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/supabase-wordmark.svg",
      className: "h-6 w-auto",
    },
    {
      name: "Figma",
      logo: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/figma-wordmark.svg",
      className: "h-5 w-auto",
    },
    {
      name: "Astro",
      logo: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/astro-wordmark.svg",
      className: "h-6 w-auto",
    },
  ],
};

export const statsSection = {
  heading: "Platform performance insights",
  description: "Ensuring stability and scalability for all users",
  link: {
    text: "Read the full impact report",
    url: "https://www.shadcnblocks.com",
  },
  stats: [
    {
      id: "stat-1",
      value: "250%+",
      label: "average growth in user engagement",
    },
    {
      id: "stat-2",
      value: "$2.5m",
      label: "annual savings per enterprise partner",
    },
    {
      id: "stat-3",
      value: "200+",
      label: "integrations with top industry platforms",
    },
    {
      id: "stat-4",
      value: "99.9%",
      label: "customer satisfaction over the last year",
    },
  ],
};
