import React from 'react';
import type { Metadata } from 'next';
import { WorkspaceProvider } from '../context/WorkspaceContext';
import { RealtimeListener } from '../components/RealtimeListener';
import './globals.css';
import '../../css/style.css';

export const metadata: Metadata = {
  title: 'CMFlow — Le Cockpit Ultime des Community Managers d\'Afrique',
  description: 'Planifiez, faites valider vos posts sur WhatsApp en 1-clic et publiez automatiquement sur Instagram et Facebook sans stress.',
  openGraph: {
    title: 'CMFlow — SaaS Tout-en-un pour Community Managers',
    description: 'La solution préférée des CMs et agences digitales à Dakar, Abidjan et en Afrique de l\'Ouest.',
    url: 'https://cmflow.sn',
    siteName: 'CMFlow',
    locale: 'fr_FR',
    type: 'website',
  },
  verification: {
    google: '4TWXbo4Ytmdr8-Lpvn3-FIFfeu5DgmYGAiAM9fVHo0k',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#F8FAFC] text-slate-800 antialiased font-sans min-h-screen flex flex-col">
        <WorkspaceProvider>
          {children}
          <RealtimeListener />
        </WorkspaceProvider>
      </body>
    </html>
  );
}
