import React from 'react';

export const WealthIllustration: React.FC = () => {
  return (
    <div className="relative w-full max-w-lg mx-auto flex items-center justify-center py-4 select-none">
      {/* Background Decorative Grid */}
      <div className="absolute top-2 right-4 w-48 h-48 bg-grid-pattern opacity-60 rounded-xl pointer-events-none" />

      {/* Triple Vertical Bar Accent (top left of illustration, matching reference) */}
      <div className="absolute -top-2 left-6 flex gap-1 z-10">
        <span className="w-1.5 h-6 bg-[#FF6B00] rounded-full" />
        <span className="w-1.5 h-6 bg-[#FF6B00] rounded-full" />
        <span className="w-1.5 h-6 bg-[#FF6B00] rounded-full" />
      </div>

      {/* Triple Horizontal Bar Accent (bottom right, matching reference) */}
      <div className="absolute -bottom-2 right-4 flex flex-col gap-1 z-10">
        <span className="w-6 h-1.5 bg-[#FF6B00] rounded-full" />
        <span className="w-6 h-1.5 bg-[#FF6B00] rounded-full" />
        <span className="w-6 h-1.5 bg-[#FF6B00] rounded-full" />
      </div>

      {/* SVG Vector Composition */}
      <svg
        viewBox="0 0 520 400"
        className="w-full h-auto drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Large Warm Sphere (Backdrop) */}
        <circle cx="340" cy="220" r="140" fill="#FDBA74" fillOpacity="0.85" />
        {/* Subtle Stripes across Sphere */}
        <path
          d="M230 180 Q320 150 450 180"
          stroke="#FB923C"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="12 12"
          opacity="0.4"
        />
        <path
          d="M220 230 Q330 200 470 230"
          stroke="#FB923C"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="14 14"
          opacity="0.4"
        />
        <path
          d="M240 280 Q340 250 450 280"
          stroke="#FB923C"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="16 16"
          opacity="0.4"
        />

        {/* Big Coral Gold Coin / Disc (Representing Wealth & Capital) */}
        <g transform="translate(120, 150) rotate(-10)">
          {/* Outer Ring */}
          <ellipse cx="60" cy="60" rx="58" ry="58" fill="#E05345" />
          <ellipse cx="58" cy="58" rx="55" ry="55" fill="#EF5D4E" />
          {/* Inner Groove */}
          <ellipse cx="58" cy="58" rx="42" ry="42" fill="#D8483B" />
          {/* Coin Center */}
          <ellipse cx="58" cy="58" rx="36" ry="36" fill="#F06553" />
          {/* Coin Highlight */}
          <path
            d="M35 30 Q65 15 85 30"
            stroke="#FFA89E"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Currency Center Mark */}
          <circle cx="58" cy="58" r="12" fill="#2D2B2A" />
          <text
            x="32"
            y="64"
            fill="#2D2B2A"
            fontSize="18"
            fontWeight="900"
            fontFamily="sans-serif"
          >
            Rp
          </text>
          <text
            x="70"
            y="64"
            fill="#2D2B2A"
            fontSize="18"
            fontWeight="900"
            fontFamily="sans-serif"
          >
            M
          </text>
        </g>

        {/* Dumbbell / Golden Wealth Barbell at the bottom left */}
        <g transform="translate(100, 240)">
          {/* Connecting Bar */}
          <rect x="35" y="44" width="75" height="12" rx="4" fill="#0D9488" />
          {/* Left Disc */}
          <rect x="15" y="10" width="22" height="80" rx="10" fill="#E05345" />
          <rect x="18" y="14" width="16" height="72" rx="7" fill="#EF5D4E" />
          {/* Right Disc */}
          <rect x="105" y="10" width="22" height="80" rx="10" fill="#E05345" />
          <rect x="108" y="14" width="16" height="72" rx="7" fill="#EF5D4E" />
        </g>

        {/* Wealth Plan Checklist Clipboard */}
        <g transform="translate(235, 185) rotate(4)">
          {/* Clipboard Board */}
          <rect x="0" y="0" width="115" height="150" rx="14" fill="#2D2B2A" />
          {/* Paper Sheet */}
          <rect x="6" y="8" width="103" height="136" rx="10" fill="#FFFFFF" />
          {/* Top Clip */}
          <rect x="34" y="-4" width="46" height="18" rx="6" fill="#0D9488" />
          <circle cx="57" cy="5" r="4" fill="#FFFFFF" />

          {/* Checklist Item 1 */}
          <rect x="16" y="28" width="16" height="16" rx="3" fill="#E6FFFA" stroke="#0D9488" strokeWidth="2" />
          <path d="M19 36 L23 40 L29 32" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="38" y="32" width="55" height="4" rx="2" fill="#2D2B2A" />
          <rect x="38" y="39" width="35" height="3" rx="1.5" fill="#94A3B8" />

          {/* Checklist Item 2 */}
          <rect x="16" y="56" width="16" height="16" rx="3" fill="#E6FFFA" stroke="#0D9488" strokeWidth="2" />
          <path d="M19 64 L23 68 L29 60" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="38" y="60" width="50" height="4" rx="2" fill="#2D2B2A" />
          <rect x="38" y="67" width="40" height="3" rx="1.5" fill="#94A3B8" />

          {/* Checklist Item 3 */}
          <rect x="16" y="84" width="16" height="16" rx="3" fill="#E6FFFA" stroke="#0D9488" strokeWidth="2" />
          <path d="M19 92 L23 96 L29 88" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="38" y="88" width="56" height="4" rx="2" fill="#2D2B2A" />
          <rect x="38" y="95" width="30" height="3" rx="1.5" fill="#94A3B8" />
        </g>

        {/* Wealth Savings Bottle / Dispenser (matching the water bottle shape from reference) */}
        <g transform="translate(390, 190)">
          {/* Bottle Body */}
          <rect x="10" y="38" width="60" height="100" rx="16" fill="#D64539" />
          <rect x="12" y="42" width="56" height="40" rx="10" fill="#E95244" />
          <rect x="12" y="88" width="56" height="46" rx="10" fill="#E95244" />
          {/* Bottle Grip Ring */}
          <rect x="8" y="78" width="64" height="12" rx="4" fill="#B9382D" />
          {/* Cap & Spout */}
          <rect x="22" y="16" width="36" height="24" rx="5" fill="#14B8A6" />
          <rect x="28" y="8" width="24" height="10" rx="3" fill="#0F766E" />
          {/* Cap ridges */}
          <line x1="26" y1="22" x2="26" y2="34" stroke="#0D9488" strokeWidth="2" />
          <line x1="32" y1="22" x2="32" y2="34" stroke="#0D9488" strokeWidth="2" />
          <line x1="38" y1="22" x2="38" y2="34" stroke="#0D9488" strokeWidth="2" />
          <line x1="44" y1="22" x2="44" y2="34" stroke="#0D9488" strokeWidth="2" />
          <line x1="50" y1="22" x2="50" y2="34" stroke="#0D9488" strokeWidth="2" />
          {/* Coins inside indicator */}
          <circle cx="40" cy="110" r="12" fill="#FBBF24" />
          <text x="35" y="115" fill="#78350F" fontSize="13" fontWeight="bold">Rp</text>
        </g>

        {/* Green Financial Growth Sneakers / Steps */}
        <g transform="translate(325, 260) rotate(-6)">
          {/* Left Shoe */}
          <path
            d="M10 40 Q25 15 50 20 Q65 24 75 42 L80 48 Q55 52 10 48 Z"
            fill="#14B8A6"
          />
          <path d="M10 44 L80 44 L82 50 L8 50 Z" fill="#2D2B2A" />
          {/* Laces */}
          <line x1="36" y1="26" x2="46" y2="28" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          <line x1="40" y1="32" x2="50" y2="34" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          <line x1="44" y1="38" x2="54" y2="40" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />

          {/* Right Shoe */}
          <g transform="translate(30, 4)">
            <path
              d="M10 40 Q25 15 50 20 Q65 24 75 42 L80 48 Q55 52 10 48 Z"
              fill="#0D9488"
            />
            <path d="M10 44 L80 44 L82 50 L8 50 Z" fill="#2D2B2A" />
            {/* Laces */}
            <line x1="36" y1="26" x2="46" y2="28" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
            <line x1="40" y1="32" x2="50" y2="34" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
            <line x1="44" y1="38" x2="54" y2="40" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          </g>
        </g>
      </svg>
    </div>
  );
};
