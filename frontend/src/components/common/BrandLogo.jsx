import React from 'react';
import { Link } from 'react-router-dom';

export const SkylineIcon = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 52 38" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Stylized golden skyline: connected architectural building silhouettes with sloped & stepped roofs */}
    {/* Left building */}
    <rect x="2" y="16" width="8" height="19" rx="0.5" fill="#B89A65" />
    <rect x="4" y="19" width="4" height="2.5" fill="#172C3B" opacity="0.3" />
    <rect x="4" y="24" width="4" height="2.5" fill="#172C3B" opacity="0.3" />
    <rect x="4" y="29" width="4" height="2.5" fill="#172C3B" opacity="0.3" />

    {/* Second building (angled roof peak) */}
    <path d="M11 12L17.5 7V35H11V12Z" fill="#CBB285" />
    <rect x="13" y="12" width="2.5" height="3" fill="#172C3B" opacity="0.3" />
    <rect x="13" y="17" width="2.5" height="3" fill="#172C3B" opacity="0.3" />
    <rect x="13" y="22" width="2.5" height="3" fill="#172C3B" opacity="0.3" />
    <rect x="13" y="27" width="2.5" height="3" fill="#172C3B" opacity="0.3" />

    {/* Center high-rise tower with stepped peak */}
    <path d="M22 2H26.5V5H29.5V35H19V5H22V2Z" fill="#B89A65" />
    <rect x="21" y="8" width="6.5" height="2.5" fill="#172C3B" opacity="0.3" />
    <rect x="21" y="13" width="6.5" height="2.5" fill="#172C3B" opacity="0.3" />
    <rect x="21" y="18" width="6.5" height="2.5" fill="#172C3B" opacity="0.3" />
    <rect x="21" y="23" width="6.5" height="2.5" fill="#172C3B" opacity="0.3" />
    <rect x="21" y="28" width="6.5" height="2.5" fill="#172C3B" opacity="0.3" />

    {/* Fourth building (angled roof) */}
    <path d="M31 9L38 4V35H31V9Z" fill="#CBB285" />
    <rect x="33" y="11" width="3" height="3" fill="#172C3B" opacity="0.3" />
    <rect x="33" y="16" width="3" height="3" fill="#172C3B" opacity="0.3" />
    <rect x="33" y="21" width="3" height="3" fill="#172C3B" opacity="0.3" />
    <rect x="33" y="26" width="3" height="3" fill="#172C3B" opacity="0.3" />

    {/* Right building */}
    <rect x="39.5" y="14" width="10.5" height="21" rx="0.5" fill="#B89A65" />
    <rect x="41.5" y="17" width="3" height="2.5" fill="#172C3B" opacity="0.3" />
    <rect x="41.5" y="22" width="3" height="2.5" fill="#172C3B" opacity="0.3" />
    <rect x="41.5" y="27" width="3" height="2.5" fill="#172C3B" opacity="0.3" />
    <rect x="45.5" y="17" width="3" height="2.5" fill="#172C3B" opacity="0.3" />
    <rect x="45.5" y="22" width="3" height="2.5" fill="#172C3B" opacity="0.3" />
    <rect x="45.5" y="27" width="3" height="2.5" fill="#172C3B" opacity="0.3" />

    {/* Ground base bar */}
    <rect x="0" y="34.5" width="52" height="2" fill="#B89A65" />
  </svg>
);

const BrandLogo = ({ light = true, showSubtitle = true, iconSize = "w-9 h-7", to = "/" }) => {
  return (
    <Link to={to} className="flex items-center space-x-2.5 group">
      <div className="flex-shrink-0 transition-transform group-hover:scale-105">
        <SkylineIcon className={iconSize} />
      </div>
      <div className="flex flex-col">
        <span
          className={`font-serif text-[19px] sm:text-[21px] font-bold tracking-tight leading-none ${
            light ? 'text-white' : 'text-[#172C3B]'
          }`}
        >
          Nagpur Realty
        </span>
        {showSubtitle && (
          <span
            className={`text-[9px] uppercase tracking-wider font-sans mt-0.5 ${
              light ? 'text-[#CBB285]' : 'text-[#8C7348]'
            }`}
          >
            Real Estate. Nagpur.
          </span>
        )}
      </div>
    </Link>
  );
};

export default BrandLogo;

