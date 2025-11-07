import { AppFooter } from './_components/layout/AppFooter';
import { AppHeader } from './_components/layout/AppHeader';

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AppHeader />
      {children}
      <AppFooter />
    </>
  );
}
