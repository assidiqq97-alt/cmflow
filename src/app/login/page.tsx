'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  // États du formulaire
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Validation et soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation simple côté client
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Veuillez renseigner votre adresse email et votre mot de passe.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage('Veuillez entrer une adresse email valide.');
      return;
    }

    setIsLoading(true);

    try {
      // Simulation d'appel API d'authentification (ex: Firebase / Supabase / NextAuth)
      await new Promise((resolve) => setTimeout(resolve, 1400));

      // Exemple de simulation : email de test
      if (email === 'erreur@cmflow.sn') {
        throw new Error('Identifiants incorrects. Veuillez vérifier votre email et mot de passe.');
      }

      setSuccessMessage('Connexion réussie ! Redirection vers votre tableau de bord...');
      // setTimeout(() => { window.location.href = '/dashboard'; }, 800);
    } catch (err: any) {
      setErrorMessage(err.message || 'Une erreur est survenue lors de la connexion. Réessayez.');
    } finally {
      setIsLoading(false);
    }
  };

  // Connexion Google
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccessMessage('Authentification Google en cours...');
    } catch (err: any) {
      setErrorMessage('Impossible de joindre le service Google. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans antialiased text-[#0F172A]">
      {/* Conteneur principal Carte SaaS */}
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[660px]">
        
        {/* =========================================================================
            COLONNE GAUCHE : FORMULAIRE D'AUTHENTIFICATION (7 colonnes sur Desktop)
            ========================================================================= */}
        <div className="md:col-span-7 lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
          
          <div>
            {/* Header avec Logo */}
            <div className="flex items-center justify-between mb-8">
              <Link href="/" className="inline-block transition-opacity hover:opacity-90">
                <div className="flex items-center gap-2">
                  <Image
                    src="/images/logo-full.svg"
                    alt="CMFlow Logo"
                    width={130}
                    height={34}
                    className="h-8 w-auto object-contain"
                    priority
                  />
                </div>
              </Link>

              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                Espace Pro
              </span>
            </div>

            {/* Titres */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                Bon retour parmi nous 👋
              </h1>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Connectez-vous pour gérer vos calendriers et validations clients en toute simplicité.
              </p>
            </div>

            {/* Alerte d'Erreur */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3 animate-fadeIn">
                <svg className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            {/* Alerte de Succès */}
            {successMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3 animate-fadeIn">
                <svg className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="flex-1 font-medium">{successMessage}</div>
              </div>
            )}

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              
              {/* Champ Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email Professionnel
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ex: awa.diop@agence.com"
                    required
                    disabled={isLoading}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 transition-all duration-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-[#0066FF] disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Champ Mot de passe */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Mot de passe
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-[#0066FF] hover:underline transition-colors"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    disabled={isLoading}
                    className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 transition-all duration-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-[#0066FF] disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Checkbox "Se souvenir de moi" */}
              <div className="flex items-center pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#0066FF] focus:ring-[#0066FF] focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm text-slate-600 font-medium">
                    Se souvenir de moi pendant 30 jours
                  </span>
                </label>
              </div>

              {/* Bouton Principal Orange Électrique (#F94F06) */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-white text-sm bg-[#F94F06] hover:bg-[#e04605] active:scale-[0.99] shadow-lg shadow-[#F94F06]/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Connexion en cours...</span>
                  </>
                ) : (
                  <>
                    <span>Se connecter</span>
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </>
                )}
              </button>

            </form>

            {/* Séparateur "OU" */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-bold tracking-wider">
                  ou
                </span>
              </div>
            </div>

            {/* Bouton Google Minimaliste */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 transition-all duration-200 flex items-center justify-center gap-3 text-sm shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuer avec Google</span>
            </button>
          </div>

          {/* Pied de Formulaire & Mention Sécurité */}
          <div className="mt-8 pt-6 border-t border-slate-100 space-y-3 text-center sm:text-left">
            <p className="text-sm text-slate-600 text-center">
              Pas encore de compte ?{' '}
              <Link
                href="/register"
                className="font-bold text-[#0066FF] hover:text-[#0052FF] hover:underline transition-colors"
              >
                Créer un compte gratuitement
              </Link>
            </p>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <svg className="w-3.5 h-3.5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Chiffrement bancaire 256-bit · </span>
              <Link href="/legal" className="underline hover:text-slate-600">
                Conditions Générales (CGU)
              </Link>
            </div>
          </div>

        </div>

        {/* =========================================================================
            COLONNE DROITE : BANNIÈRE VISUELLE (Visible uniquement sur md: et lg:)
            ========================================================================= */}
        <div className="hidden md:flex md:col-span-5 lg:col-span-5 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0A101D] p-8 lg:p-10 flex-col justify-between relative overflow-hidden text-white border-l border-slate-800">
          
          {/* Halos lumineux d'arrière-plan */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#0066FF]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#F94F06]/15 rounded-full blur-3xl pointer-events-none" />

          {/* En-tête de bannière */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-sky-300 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#F94F06] animate-pulse"></span>
              SaaS pensé pour les CMs d'Afrique
            </div>

            <h2 className="text-xl lg:text-2xl font-extrabold leading-snug tracking-tight text-white">
              « Gagnez 10 heures par semaine sur vos allers-retours clients. »
            </h2>
            <p className="text-xs lg:text-sm text-slate-300 mt-2 leading-relaxed">
              Fini les validations perdues sur WhatsApp. Envoyez un lien unique, recevez les accords en un clic et publiez sans stress.
            </p>
          </div>

          {/* Carte Visuelle Miniature : Validation Client WhatsApp */}
          <div className="relative z-10 my-6">
            <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-4 lg:p-5 shadow-2xl space-y-3.5 transform transition-transform duration-300 hover:scale-[1.02]">
              
              {/* Header de la carte notification */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366]">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.15c-1.5 0-2.97-.39-4.27-1.14l-.31-.18-3.17.83.85-3.09-.2-.32a8.188 8.188 0 0 1-1.25-4.34c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.01 4.54-3.68 8.23-8.12 8.23z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Notification Validation</div>
                    <div className="text-[10px] text-slate-300">Il y a 2 minutes · Client Teranga</div>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping"></span>
                  Validé
                </span>
              </div>

              {/* Message de confirmation */}
              <div className="bg-black/20 rounded-xl p-3 border border-white/5 text-xs text-slate-200 leading-relaxed">
                <span className="font-semibold text-white">« Parfait pour le planning d'août ! »</span> Les 8 visuels et légendes sont validés. 🎉
              </div>

              {/* Pastille de statut */}
              <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1">
                <span>Prêt pour programmation</span>
                <span className="font-bold text-[#F94F06] flex items-center gap-1">
                  100% Automatisé
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              </div>

            </div>
          </div>

          {/* Social Proof Bas de Bannière */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2 overflow-hidden">
                <div className="inline-block h-7 w-7 rounded-full ring-2 ring-[#0F172A] bg-amber-400 flex items-center justify-center text-[10px] font-black text-slate-900">
                  AD
                </div>
                <div className="inline-block h-7 w-7 rounded-full ring-2 ring-[#0F172A] bg-sky-400 flex items-center justify-center text-[10px] font-black text-slate-900">
                  SK
                </div>
                <div className="inline-block h-7 w-7 rounded-full ring-2 ring-[#0F172A] bg-emerald-400 flex items-center justify-center text-[10px] font-black text-slate-900">
                  MT
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-300">
                +240 CMs actifs
              </span>
            </div>

            <div className="text-xs text-slate-400">
              Dakar 🇸🇳 · Abidjan 🇨🇮
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
