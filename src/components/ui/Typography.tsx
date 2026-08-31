import React from 'react';

// =============================================================================
// COMPOSANTS TYPOGRAPHIQUES DESIGN SYSTEM (CMFlow)
// =============================================================================

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
}

/** H1 : 32px Mobile / 48px Desktop (Gras, Interligne serré 1.1 - 1.2) */
export const H1: React.FC<HeadingProps> = ({ children, className = '', ...props }) => (
  <h1
    className={`text-[32px] md:text-[48px] font-black text-slate-900 tracking-tight leading-[1.15] md:leading-[1.1] ${className}`}
    {...props}
  >
    {children}
  </h1>
);

/** H2 : 24px Mobile / 32px Desktop (Semi-gras, Interligne 1.2 - 1.25) */
export const H2: React.FC<HeadingProps> = ({ children, className = '', ...props }) => (
  <h2
    className={`text-[24px] md:text-[32px] font-bold text-slate-900 tracking-tight leading-[1.25] md:leading-[1.2] ${className}`}
    {...props}
  >
    {children}
  </h2>
);

/** H3 : 18px Mobile / 22px Desktop (Moyen, Interligne 1.3 - 1.35) */
export const H3: React.FC<HeadingProps> = ({ children, className = '', ...props }) => (
  <h3
    className={`text-[18px] md:text-[22px] font-semibold text-slate-800 tracking-normal leading-[1.35] md:leading-[1.3] ${className}`}
    {...props}
  >
    {children}
  </h3>
);

interface ParagraphProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  className?: string;
}

/** Paragraph (P) : 16px (Interligne aéré 1.6, couleur contrastée) */
export const Paragraph: React.FC<ParagraphProps> = ({ children, className = '', ...props }) => (
  <p
    className={`text-base text-slate-600 leading-[1.6] font-normal ${className}`}
    {...props}
  >
    {children}
  </p>
);

interface CaptionProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  className?: string;
}

/** Caption / Mention : 13px - 14px (Gris neutre) */
export const Caption: React.FC<CaptionProps> = ({ children, className = '', ...props }) => (
  <span
    className={`text-[13px] md:text-[14px] text-slate-500 leading-normal font-medium ${className}`}
    {...props}
  >
    {children}
  </span>
);
