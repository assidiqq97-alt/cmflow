// OrangeMoneyLogo.tsx — Logo officiel Orange Money (UEMOA)
import React from 'react';

interface OrangeMoneyLogoProps {
  size?: number;
  className?: string;
}

export function OrangeMoneyLogo({ size = 32, className = '' }: OrangeMoneyLogoProps) {
  return (
    <img
      src="/images/orange-logo.png"
      alt="Orange Money"
      style={{ width: size, height: size, objectFit: 'contain' }}
      className={`shrink-0 rounded-lg ${className}`}
    />
  );
}

// Variante avec texte "Orange Money"
export function OrangeMoneyLogoWithText({ height = 32 }: { height?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <img
        src="/images/orange-logo.png"
        alt="Orange"
        style={{ height, width: height, objectFit: 'contain' }}
        className="rounded-lg shrink-0"
      />
      <span style={{ fontSize: height * 0.42, fontWeight: 900, color: '#FF7900' }}>
        Orange Money
      </span>
    </div>
  );
}

export default OrangeMoneyLogo;
