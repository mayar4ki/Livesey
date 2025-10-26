import { bottomLinks, copyright } from '@/white-label';

export const DashboardFooter = () => {
  return (
    <div className=" sticky bottom-0 px-4 bg-blur-3xl backdrop-blur-md border-t border-foreground/20 flex flex-col justify-between text-xs  py-0.5 font-semibold md:flex-row md:items-center">
      <p>{copyright}</p>
      <ul className="flex gap-4">
        {bottomLinks.map((link, linkIdx) => (
          <li key={linkIdx} className="hover:text-primary underline">
            <a href={link.url}>{link.text}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};
