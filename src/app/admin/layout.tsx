'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminPinModal from '../../components/admin/AdminPinModal';
import AdminService from '../../lib/adminService';

const ADMIN_WHITELIST = ['admin@cmflow.sn', 'sidiqq97@gmail.com'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [statsSummary, setStatsSummary] = useState({ mrrText: '3 345 000 FCFA', activeCount: 188 });

  useEffect(() => {
    // Calcul initial des stats rapides pour la sidebar
    try {
      const kpis = AdminService.calculateKPIs();
      setStatsSummary({
        mrrText: `${kpis.mrr.toLocaleString('fr-FR')} FCFA`,
        activeCount: kpis.activeUsersCount,
      });
    } catch {}

    // 1. Vérification session PIN locale
    const isSessionAuth = sessionStorage.getItem('cmflow_admin_auth') === 'true';

    // 2. Vérification Firebase Auth & RBAC Firestore
    if (!auth) {
      if (isSessionAuth) {
        setIsUnlocked(true);
      } else {
        setIsPinModalOpen(true);
      }
      setIsCheckingAuth(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (isSessionAuth) {
          setIsUnlocked(true);
        } else {
          setIsPinModalOpen(true);
        }
        setIsCheckingAuth(false);
        return;
      }

      const email = (user.email || '').toLowerCase().trim();
      let hasAdminPrivileges = ADMIN_WHITELIST.includes(email);

      try {
        const idToken = await user.getIdTokenResult();
        if (idToken?.claims?.admin === true || idToken?.claims?.role === 'admin') {
          hasAdminPrivileges = true;
        }

        if (!hasAdminPrivileges && db) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.data();
          if (
            userData?.role === 'admin' ||
            userData?.isAdmin === true ||
            userData?.role === 'superadmin' ||
            userData?.isSuperAdmin === true
          ) {
            hasAdminPrivileges = true;
          }
        }
      } catch (e) {
        console.warn('Vérification Firestore Admin:', e);
      }

      if (!hasAdminPrivileges && !ADMIN_WHITELIST.includes(email)) {
        router.replace('/dashboard');
        return;
      }

      if (isSessionAuth) {
        setIsUnlocked(true);
      } else {
        setIsPinModalOpen(true);
      }
      setIsCheckingAuth(false);
    });

    return () => unsub();
  }, [router]);

  const handleUnlockSuccess = () => {
    setIsUnlocked(true);
    setIsPinModalOpen(false);
  };

  const handleLockSession = () => {
    sessionStorage.removeItem('cmflow_admin_auth');
    setIsUnlocked(false);
    setIsPinModalOpen(true);
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen w-full bg-slate-900 text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#F94F06] to-amber-500 flex items-center justify-center font-black text-2xl animate-pulse shadow-lg shadow-orange-500/25">
          ⚡
        </div>
        <div className="text-xs font-semibold text-slate-400">
          Vérification des privilèges Super-Administrateur...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-orange-500 selection:text-white">
      
      {/* Modale PIN de Sécurité */}
      <AdminPinModal
        isOpen={isPinModalOpen || !isUnlocked}
        onUnlockSuccess={handleUnlockSuccess}
      />

      {/* Sidebar Super-Admin Sombre Premium */}
      <AdminSidebar
        onLockSession={handleLockSession}
        mrrText={statsSummary.mrrText}
        activeCount={statsSummary.activeCount}
      />

      {/* Zone de contenu principale en Gris Ardoise Clair (Linear/Stripe Style) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-slate-50 overflow-y-auto">
        <main className="flex-1">
          {children}
        </main>
      </div>

    </div>
  );
}
