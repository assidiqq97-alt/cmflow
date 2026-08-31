import React from 'react';

// =============================================================================
// COMPOSANT BOUTON UNIFIÉ DESIGN SYSTEM (CMFlow)
// =============================================================================

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'small';
  icon?: React.ReactNode;
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  icon,
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  // Styles de base ergonomiques (Touch Target min 44px - 48px, accessibilité au pouce)
  const baseStyles = 'inline-flex items-center justify-center gap-2 select-none font-sans active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

  const variants = {
    // 1. Primaire (CTA d'action principal - Orange CMFlow)
    primary: 'min-h-[44px] md:min-h-[48px] px-5 py-2.5 rounded-2xl bg-[#F94F06] hover:bg-[#e04605] text-white font-extrabold text-sm md:text-base shadow-lg shadow-[#F94F06]/25 hover:shadow-[#F94F06]/40',
    // 2. Secondaire (Neutre & Sobre)
    secondary: 'min-h-[44px] md:min-h-[48px] px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/90 font-bold text-sm md:text-base shadow-xs',
    // 3. Small (Tableaux, Cartes & Actions Compactes)
    small: 'min-h-[36px] px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs md:text-sm',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};
