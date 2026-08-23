// OrangeMoneyLogo.tsx — Logo vectoriel SVG Orange Money (UEMOA)
// Couleurs officielles : fond orange #FF7900, symbole OM blanc officiel

import React from 'react';

interface OrangeMoneyLogoProps {
  size?: number;
  className?: string;
}

export function OrangeMoneyLogo({ size = 32, className = '' }: OrangeMoneyLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Orange Money"
      role="img"
    >
      {/* Fond arrondi Orange */}
      <rect width="48" height="48" rx="12" fill="#FF7900" />

      {/* Lettre "O" stylisée — cercle épais blanc */}
      <circle
        cx="24"
        cy="22"
        r="10"
        stroke="white"
        strokeWidth="4"
        fill="none"
      />

      {/* Trait horizontal du "M" - base */}
      <rect x="12" y="34" width="24" height="3.5" rx="1.75" fill="white" />

      {/* Éclair / symbole monnaie au centre du O */}
      <path
        d="M26 17 L22 23 L25 23 L22 29 L28 21 L25 21 Z"
        fill="white"
      />
    </svg>
  );
}

// Variante avec texte "Orange Money"
export function OrangeMoneyLogoWithText({ height = 32 }: { height?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <OrangeMoneyLogo size={height} />
      <div style={{ lineHeight: 1.1 }}>
        <div
          style={{
            fontSize: height * 0.38,
            fontWeight: 900,
            color: '#FF7900',
            letterSpacing: '-0.02em',
          }}
        >
          Orange
        </div>
        <div
          style={{
            fontSize: height * 0.3,
            fontWeight: 700,
            color: '#EA580C',
            letterSpacing: '-0.01em',
          }}
        >
          Money
        </div>
      </div>
    </div>
  );
}

export default OrangeMoneyLogo;
