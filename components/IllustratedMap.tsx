
import React from 'react';
import { SP_MAP_DATA, SP_ZONES } from '../constants';
import LandmarkIcon from './LandmarkIcon';

interface IllustratedMapProps {
  onLandmarkClick: (id: string) => void;
}

const IllustratedMap: React.FC<IllustratedMapProps> = ({ onLandmarkClick }) => {
  return (
    <div className="relative w-full h-full bg-slate-50 overflow-hidden flex flex-col">
      <div className="p-6 bg-white border-b border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="font-display text-3xl font-black text-slate-800 tracking-tight">São Paulo Illustrée</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Carte artistique des principales zones et monuments</p>
        </div>
      </div>
      
      <div className="flex-1 relative overflow-auto bg-[#f8f9fa] flex items-center justify-center p-4">
        <svg 
          viewBox="0 0 1000 1414" 
          className="w-full max-w-[800px] h-auto drop-shadow-2xl bg-white rounded-[40px] border-[12px] border-white shadow-xl"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background Grid */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="1"/>
            </pattern>
            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="10" />
              <feOffset dx="0" dy="5" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Zones Polygons */}
          <g opacity="0.15">
            {SP_ZONES.map(zone => (
              <polygon 
                key={zone.id} 
                points={zone.points} 
                fill={zone.color} 
                className="transition-opacity hover:opacity-30 cursor-help"
              />
            ))}
          </g>

          {/* Rivers (Stylized) */}
          <g className="opacity-40">
            <path 
              d="M0,380 Q300,410 500,380 T1000,410" 
              fill="none" 
              stroke="#0ea5e9" 
              strokeWidth="15" 
              strokeLinecap="round"
              filter="url(#softShadow)"
            />
            <text x="50" y="370" className="text-[14px] fill-sky-600 italic font-black uppercase tracking-widest">Rivière Tietê</text>
            
            <path 
              d="M250,950 Q320,750 375,395" 
              fill="none" 
              stroke="#0ea5e9" 
              strokeWidth="12" 
              strokeLinecap="round"
              filter="url(#softShadow)"
            />
            <text x="240" y="800" className="text-[14px] fill-sky-600 italic font-black uppercase tracking-widest" transform="rotate(-65, 240, 800)">Rivière Pinheiros</text>
          </g>

          {/* Zone Labels */}
          <g>
            {SP_ZONES.map(zone => {
              const [x, y] = zone.points.split(' ')[0].split(',').map(Number);
              return (
                <text 
                  key={`label-${zone.id}`}
                  x={x + 20} 
                  y={y + 40} 
                  className="font-black text-[12px] uppercase tracking-[0.2em]" 
                  fill={zone.color}
                >
                  {zone.name}
                </text>
              );
            })}
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

          {/* Compass */}
          <g transform="translate(900, 100)" className="opacity-40">
            <circle r="40" fill="none" stroke="#64748b" strokeWidth="2" />
            <path d="M0,-30 L10,0 L0,30 L-10,0 Z" fill="#ef4444" />
            <path d="M0,30 L-10,0 L0,-30 L10,0 Z" fill="#64748b" opacity="0.5" />
            <text y="-45" textAnchor="middle" className="text-[18px] fill-slate-800 font-black">N</text>
          </g>
        </svg>
      </div>
    </div>
  );
};

export default IllustratedMap;
