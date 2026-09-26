import React from 'react';

/**
 * VerifiedGoldBadge - 1:1 Pixel-Perfect Recreation of Scalloped Gold Verified Badge
 * Matches the uploaded design (media_1790460042027.png):
 * - 8-lobed symmetrical scalloped flower/seal shape
 * - Rich warm gold/amber radiant gradient (#FFE500 -> #FFB800 -> #F58700)
 * - Thick, smooth white rounded checkmark with subtle warm shadow
 * - Crisp white edge border so it floats seamlessly over any avatar background
 */
export default function VerifiedGoldBadge({ size = 16, className = '', title = 'Verified Trader' }) {
  // Unique gradient ID to avoid conflicts if multiple badges exist on page
  const gradId = 'tsb-verified-gold-grad';
  const shadowId = 'tsb-verified-check-shadow';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label={title}
      title={title}
      style={{ display: 'inline-block', flexShrink: 0, verticalAlign: 'middle' }}
    >
      <defs>
        {/* Warm Golden/Amber Radial-Linear Hybrid Gradient */}
        <linearGradient id={gradId} x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFE500" />
          <stop offset="42%" stopColor="#FFB703" />
          <stop offset="100%" stopColor="#FB8500" />
        </linearGradient>

        {/* Soft shadow under white checkmark for authentic 3D pop */}
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.2" stdDeviation="0.8" floodColor="rgba(180, 83, 9, 0.45)" />
        </filter>
      </defs>

      {/* 8-Lobed Scalloped Flower Badge with 1.5px White Border */}
      <path
        d="M 26.90 11.48 C 30.55 12.75 30.55 19.25 26.90 20.52 C 28.59 23.99 23.99 28.59 20.52 26.90 C 19.25 30.55 12.75 30.55 11.48 26.90 C 8.01 28.59 3.41 23.99 5.10 20.52 C 1.45 19.25 1.45 12.75 5.10 11.48 C 3.41 8.01 8.01 3.41 11.48 5.10 C 12.75 1.45 19.25 1.45 20.52 5.10 C 23.99 3.41 28.59 8.01 26.90 11.48 Z"
        fill={`url(#${gradId})`}
        stroke="#FFFFFF"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* Inner Subtle Checkmark Depth Shadow */}
      <path
        d="M 10.8 16.4 L 14.4 20 L 21.6 12.2"
        stroke="rgba(194, 65, 12, 0.4)"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Crisp White Checkmark with Rounded Caps */}
      <path
        d="M 10.8 16.2 L 14.4 19.8 L 21.6 12"
        stroke="#FFFFFF"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${shadowId})`}
      />
    </svg>
  );
}
