import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

/**
 * 4K Ultra HD Saf Vektörel AI Zeka Yıldızı (Transparent / Arka Plansız)
 * 
 * - Arka plan kutusu, border veya squircle yoktur.
 * - Sadece saf, yüksek çözünürlüklü, zümrüt/mint/parlak beyaz ışık kırılımlı 4-köşeli yapay zeka yıldızı.
 * - Vektörel SVG olduğu için 4K/8K/Retina ekranlarda sıfır kayıp, sonsuz netlik ve keskinlik.
 */
export function DarkPeakLogo({ className = "w-6 h-6", size, glow = true }: LogoProps) {
  const customStyle = size ? { width: `${size}px`, height: `${size}px` } : undefined;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={customStyle}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full overflow-visible ${
          glow ? "filter drop-shadow-[0_0_16px_rgba(52,211,153,0.55)]" : ""
        }`}
      >
        <defs>
          {/* 4K Zümrüt & Nane Kristal Işık Gradyanı */}
          <linearGradient id="pureStarGradient" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A7F3D0" />
            <stop offset="25%" stopColor="#34D399" />
            <stop offset="65%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          {/* Dikey Işık Yansıması */}
          <linearGradient id="verticalSheen" x1="50" y1="6" x2="50" y2="94" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#6EE7B7" stopOpacity="0" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0.6" />
          </linearGradient>

          {/* Merkez Radyal Parıltı */}
          <radialGradient id="centerSparkleGlow" cx="50" cy="50" r="45" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="18%" stopColor="#6EE7B7" stopOpacity="0.7" />
            <stop offset="55%" stopColor="#10B981" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. Arka Yumuşak Havadar Işık Aurası */}
        <circle cx="50" cy="50" r="38" fill="url(#centerSparkleGlow)" opacity="0.5" />

        {/* 2. Ana 4-Köşeli Kusursuz Geometrik AI Yıldızı */}
        <path
          d="M50 6C50 30.3005 30.3005 50 6 50C30.3005 50 50 69.6995 50 94C50 69.6995 69.6995 50 94 50C69.6995 50 50 30.3005 50 6Z"
          fill="url(#pureStarGradient)"
        />

        {/* 3. İnce Üst Işık Yansıması / Kristal Faset */}
        <path
          d="M50 6C50 30.3005 30.3005 50 6 50C30.3005 50 50 69.6995 50 94C50 69.6995 69.6995 50 94 50C69.6995 50 50 30.3005 50 6Z"
          fill="url(#verticalSheen)"
          opacity="0.4"
        />

        {/* 4. Merkez Ultra HD Beyaz Çekirdek Noktası */}
        <circle cx="50" cy="50" r="5.5" fill="#FFFFFF" />
        <circle cx="50" cy="50" r="9" fill="#FFFFFF" opacity="0.35" />
      </svg>
    </div>
  );
}

/**
 * Karşılama Ekranı ve Büyük Vitrinler için Arka Plansız Saf Yıldız
 */
export function DarkPeakAppIcon({ size = 64, className = "" }: { size?: number; className?: string }) {
  return (
    <div
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`flex items-center justify-center relative select-none shrink-0 group transition-transform duration-300 hover:scale-110 ${className}`}
    >
      <DarkPeakLogo size={size} glow={true} />
    </div>
  );
}
