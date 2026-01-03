
import React from 'react';

interface LandmarkIconProps {
  type: 'monument' | 'park' | 'street' | 'river' | 'custom';
  x: number;
  y: number;
  name: string;
  color?: string;
  symbol?: string;
  onClick: () => void;
}

const LandmarkIcon: React.FC<LandmarkIconProps> = ({ type, x, y, name, color, symbol, onClick }) => {
  const getIcon = () => {
    switch (type) {
      case 'monument':
        return (
          <path 
            d="M-5,10 L5,10 L3,-8 L-3,-8 Z" 
            fill="#e11d48" 
            stroke="#fff" 
            strokeWidth="1.5"
          />
        );
      case 'park':
        return (
          <circle r="8" fill="#16a34a" stroke="#fff" strokeWidth="2" />
        );
      case 'street':
        return (
          <rect x="-15" y="-3" width="30" height="6" rx="2" fill="#475569" stroke="#fff" strokeWidth="1" />
        );
      case 'custom':
        return (
          <g>
             <rect x="-10" y="-10" width="20" height="20" rx="4" fill={color || '#6366f1'} stroke="#fff" strokeWidth="2" />
             <circle r="2" fill="#fff" cy="0" />
          </g>
        );
      default:
        return <circle r="5" fill="#000" />;
    }
  };

  return (
    <g transform={`translate(${x}, ${y})`} onClick={onClick} className="cursor-pointer group">
      {/* Glow Effect */}
      <circle r="18" fill="rgba(255,255,255,0.6)" className="opacity-0 group-hover:opacity-100 transition-opacity" />
      {getIcon()}
      <text
        y="25"
        textAnchor="middle"
        className="text-[12px] font-bold fill-slate-800 drop-shadow-sm select-none pointer-events-none group-hover:fill-indigo-600 transition-colors"
        style={{ fontSize: '12px', fontWeight: 800 }}
      >
        {name}
      </text>
    </g>
  );
};

export default LandmarkIcon;
