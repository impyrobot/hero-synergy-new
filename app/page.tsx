'use client';

import dynamic from 'next/dynamic';

const HeroSynergyDashboard = dynamic(
  () => import('../components/HeroSynergyDashboard'),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="min-h-screen p-4 bg-gray-50">
      <HeroSynergyDashboard />
    </main>
  );
} 