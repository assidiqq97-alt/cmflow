import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Share2,
  Zap,
  Calendar,
  ShieldCheck,
  Smartphone,
  BarChart3,
} from 'lucide-react';
import { PricingSection } from '../components/PricingSection';

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col">
      {/* =======================================================================
          1. BARRE DE NAVIGATION (HEADER PREMIUM)
          ======================================================================= */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#F94F06] to-orange-400 flex items-center justify-center text-white font-black text-lg shadow-md shadow-orange-500/25">
              CM
            </div>
            <span className="text-xl font-black tracking-tight text-[#0F172A]">
              CM<span className="text-[#F94F06]">Flow</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600">
            <a href="#features" className="hover:text-[#F94F06] transition-colors">
              Fonctionnalités
            </a>
            <a href="#validation" className="hover:text-[#F94F06] transition-colors">
              Validation WhatsApp
            </a>
            <a href="#pricing" className="hover:text-[#F94F06] transition-colors">
              Tarifs & Offres
            </a>
            <a href="#faq" className="hover:text-[#F94F06] transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-xl transition-colors"
            >
              Se connecter
            </Link>
            <a
              href="#pricing"
              className="px-4 py-2.5 rounded-2xl bg-[#F94F06] hover:bg-[#e04605] text-white text-xs font-black shadow-md shadow-orange-500/25 active:scale-[0.98] transition-all flex items-center gap-1.5"
            >
              <span>Essai Gratuit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* =======================================================================
          2. SECTION HÉROS (HERO SECTION)
          ======================================================================= */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-gradient-to-b from-orange-50/30 via-slate-50 to-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-[#F94F06] text-xs font-black uppercase tracking-wider animate-in fade-in slide-in-from-top-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SaaS Spécialement Pensé pour les CMs d'Afrique 🇸🇳 🇨🇮</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0F172A] tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Planifiez, faites valider sur <span className="text-[#10B981]">WhatsApp</span> et publiez sans stress.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Fini les visuels éparpillés et les retards d’approbation. Envoyez un lien magique sécurisé à votre client et laissez CMFlow publier automatiquement sur Instagram et Facebook.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/register?plan=starter"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-[#F94F06] hover:bg-[#e04605] text-white text-sm font-black shadow-xl shadow-orange-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>Démarrer l'essai 14 jours (Sans CB)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#validation"
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <span>Voir la démo WhatsApp 💬</span>
            </a>
          </div>

          {/* Points de Réassurance */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Paiement Wave & Orange Money</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Auto-Publish Meta Officiel</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Aucun compte requis pour le client</span>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================================
          3. BENTO GRID FONCTIONNALITÉS
          ======================================================================= */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#F94F06]">
              Tout ce dont vous avez besoin
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
              Une boîte à outils conçue pour quadrupler votre productivité
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bento 1 : Planning */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-[#F94F06] flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Planning & Calendrier Drag-and-Drop</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Visualisez vos publications par mois, semaine ou grille Instagram. Déplacez vos dates en un glissement de souris.
              </p>
            </div>

            {/* Bento 2 : Validation WhatsApp */}
            <div id="validation" className="p-7 rounded-3xl bg-emerald-50/50 border border-emerald-100 space-y-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-[#10B981] flex items-center justify-center">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Validation Client WhatsApp 1-Clic</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Générez un lien d'aperçu immersif. Vos clients valident ou demandent des retouches depuis leur smartphone en 10 secondes.
              </p>
            </div>

            {/* Bento 3 : Auto-Publish Meta */}
            <div className="p-7 rounded-3xl bg-blue-50/50 border border-blue-100 space-y-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-[#0066FF] flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Auto-Publish Instagram & Facebook</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Dès que le client clique sur « Approuver », CMFlow programme la diffusion automatique via l'API Meta Graph officielle.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* =======================================================================
          4. SECTION TARIFS INTERACTIVE AVEC WAVE & ORANGE MONEY
          ======================================================================= */}
      <PricingSection />

      {/* =======================================================================
          5. PIED DE PAGE (FOOTER)
          ======================================================================= */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#F94F06] flex items-center justify-center text-white font-black text-xs">
              CM
            </div>
            <span className="text-base font-black text-white">CMFlow</span>
            <span className="text-slate-600">·</span>
            <span>Le SaaS des Community Managers d'Afrique 🇸🇳 🇨🇮</span>
          </div>

          <div className="flex items-center gap-6 font-semibold">
            <a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a>
            <a href="#pricing" className="hover:text-white transition-colors">Tarifs</a>
            <Link href="/login" className="hover:text-white transition-colors">Connexion</Link>
          </div>

          <div>
            © {new Date().getFullYear()} CMFlow. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
