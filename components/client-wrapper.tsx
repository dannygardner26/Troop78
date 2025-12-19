'use client';

import dynamic from 'next/dynamic';

const Navigation = dynamic(() => import('@/components/navigation').then(mod => ({ default: mod.Navigation })), { ssr: false });
const GlobalSearch = dynamic(() => import('@/components/global-search').then(mod => ({ default: mod.GlobalSearch })), { ssr: false });

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      <main>{children}</main>
      <GlobalSearch />
    </>
  );
}
