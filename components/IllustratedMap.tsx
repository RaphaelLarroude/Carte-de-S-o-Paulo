
import React from 'react';
import { SP_MAP_DATA } from '../constants';
import LandmarkIcon from './LandmarkIcon';

interface IllustratedMapProps {
  onLandmarkClick: (id: string) => void;
}

const IllustratedMap: React.FC<IllustratedMapProps> = ({ onLandmarkClick }) => {
  return (
    <div className="relative w-full aspect-[297/420] bg-sky-50 rounded-xl overflow-hidden shadow-2xl border-8 border-white print:border-0 print:shadow-none print:rounded-none">
      <svg 
        viewBox="0 0 1000 1414" 
        className="w-full h-full drop-shadow-xl"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background Texture/Grid */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Rivers */}
        <g className="opacity-40">
          {/* Tietê River */}
          <path 
            d="M0,350 Q300,380 500,350 T1000,380" 
            fill="none" 
            stroke="#0ea5e9" 
            strokeWidth="15" 
            strokeLinecap="round"
          />
          <text x="50" y="340" className="text-[10px] fill-sky-600 italic font-bold">Rivière Tietê</text>
          
          {/* Pinheiros River */}
          <path 
            d="M200,950 Q280,750 350,365" 
            fill="none" 
            stroke="#0ea5e9" 
            strokeWidth="12" 
            strokeLinecap="round"
          />
          <text x="220" y="800" className="text-[10px] fill-sky-600 italic font-bold" transform="rotate(-65, 220, 800)">Rivière Pinheiros</text>
        </g>

        {/* Landmarks */}
        {SP_MAP_DATA.landmarks.map((landmark) => (
          <LandmarkIcon
            key={landmark.id}
            type={landmark.type}
            x={landmark.coordinates.x || 500}
            y={landmark.coordinates.y || 700}
            name={landmark.name}
            color={landmark.color}
            symbol={landmark.symbol}
            onClick={() => onLandmarkClick(landmark.id)}
          />
        ))}

        {/* Compass / Orientation */}
        <g transform="translate(900, 100)" className="opacity-50">
          <circle r="40" fill="none" stroke="#64748b" strokeWidth="2" />
          <path d="M0,-30 L10,0 L0,30 L-10,0 Z" fill="#64748b" />
          <text y="-45" textAnchor="middle" className="text-[14px] fill-slate-500 font-bold">N</text>
        </g>

        {/* Map Title (Decorative for Print) */}
        <text x="50" y="80" className="font-display fill-slate-800 text-5xl" style={{ fontSize: '56px' }}>São Paulo</text>
        <text x="50" y="115" className="fill-slate-500 font-bold uppercase tracking-[0.2em]" style={{ fontSize: '14px' }}>Carte des points forts et monuments</text>
      </svg>
    </div>
  );
};

export default IllustratedMap;
