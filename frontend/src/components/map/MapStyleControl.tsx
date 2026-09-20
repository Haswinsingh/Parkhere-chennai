import React from 'react';
import { Layers, Globe, Map } from 'lucide-react';

export type MapStyle = 'satellite' | 'street';

interface MapStyleControlProps {
  currentStyle: MapStyle;
  onStyleChange: (style: MapStyle) => void;
  className?: string;
}

export const MapStyleControl: React.FC<MapStyleControlProps> = ({
  currentStyle,
  onStyleChange,
  className = '',
}) => {
  return (
    <div
      className={`bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/80 p-1 flex items-center gap-1 z-[1000] ${className}`}
    >
      <button
        type="button"
        onClick={() => onStyleChange('satellite')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
          currentStyle === 'satellite'
            ? 'bg-slate-900 text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
        title="Switch to Real-World Satellite Imagery"
      >
        <Globe className="w-3.5 h-3.5" />
        <span>Satellite</span>
      </button>

      <button
        type="button"
        onClick={() => onStyleChange('street')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
          currentStyle === 'street'
            ? 'bg-slate-900 text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
        title="Switch to Street Map"
      >
        <Map className="w-3.5 h-3.5" />
        <span>Street</span>
      </button>
    </div>
  );
};
