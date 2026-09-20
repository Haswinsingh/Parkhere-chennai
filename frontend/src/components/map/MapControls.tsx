import React from 'react';
import { Plus, Minus, Navigation, Maximize2, Minimize2 } from 'lucide-react';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenterOnMe?: () => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
  isLocating?: boolean;
  hasUserLocation?: boolean;
  className?: string;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onCenterOnMe,
  onToggleFullscreen,
  isFullscreen = false,
  isLocating = false,
  hasUserLocation = false,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-1.5 z-[1000] ${className}`}>
      {/* Zoom In & Out */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/80 overflow-hidden flex flex-col divide-y divide-slate-100">
        <button
          type="button"
          onClick={onZoomIn}
          className="p-2.5 hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onZoomOut}
          className="p-2.5 hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Center on Me */}
      {onCenterOnMe && (
        <button
          type="button"
          onClick={onCenterOnMe}
          disabled={isLocating}
          className={`p-2.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/80 transition-all ${
            hasUserLocation
              ? 'text-blue-600 hover:bg-blue-50'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
          title="Center on My Device Location"
        >
          <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
        </button>
      )}

      {/* Fullscreen Toggle */}
      {onToggleFullscreen && (
        <button
          type="button"
          onClick={onToggleFullscreen}
          className="p-2.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/80 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen Map'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
};
