import { AppFooter } from './components/layout/AppFooter';
import { AppHeader } from './components/layout/AppHeader';

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
