// WaveLogo.tsx — Logo officiel Wave (Sénégal / Côte d'Ivoire)
import React from 'react';

interface WaveLogoProps {
  size?: number;
  className?: string;
}

export function WaveLogo({ size = 32, className = '' }: WaveLogoProps) {
  return (
    <img
      src="/images/wave-logo.png"
      alt="Wave"
      style={{ width: 'auto', height: size, objectFit: 'contain' }}
      className={`shrink-0 ${className}`}
    />
  );
}

// Variante avec texte "Wave"
export function WaveLogoWithText({ height = 32 }: { height?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <img
        src="/images/wave-logo.png"
        alt="Wave"
        style={{ height, width: 'auto', objectFit: 'contain' }}
      />
    </div>
  );
}

export default WaveLogo;
