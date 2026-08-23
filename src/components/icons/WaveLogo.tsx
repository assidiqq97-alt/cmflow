// WaveLogo.tsx — Logo vectoriel SVG Wave (Sénégal / Côte d'Ivoire)
// Couleurs officielles : fond cyan #1DC2EC, vague blanche, point jaune #FFD700

import React from 'react';

interface WaveLogoProps {
  size?: number;
  className?: string;
}

export function WaveLogo({ size = 32, className = '' }: WaveLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Wave Mobile Money"
      role="img"
    >
      {/* Fond arrondi cyan Wave */}
      <rect width="48" height="48" rx="12" fill="#1DC2EC" />

      {/* Vague principale blanche */}
      <path
        d="M6 28 C10 22, 16 34, 22 28 C28 22, 34 34, 42 28"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Vague secondaire blanche (plus petite, décalée vers le haut) */}
      <path
        d="M6 22 C10 16, 16 28, 22 22 C28 16, 34 28, 42 22"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Point jaune signature Wave */}
      <circle cx="36" cy="14" r="4.5" fill="#FFD700" />
      <circle cx="36" cy="14" r="2.5" fill="#FFA500" />
    </svg>
  );
}

// Variante avec texte "Wave"
export function WaveLogoWithText({ height = 32 }: { height?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <WaveLogo size={height} />
      <span
        style={{
          fontSize: height * 0.45,
          fontWeight: 900,
          color: '#1DC2EC',
          letterSpacing: '-0.02em',
        }}
      >
        Wave
      </span>
    </div>
  );
}

export default WaveLogo;
