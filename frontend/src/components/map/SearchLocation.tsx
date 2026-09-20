import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader2, MapPin, X } from 'lucide-react';
import { locationService, GeocodedLocation } from '../../services/locationService';
import { useLocation } from '../../context/LocationContext';

interface SearchLocationProps {
  onLocationSelected?: (loc: GeocodedLocation) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Reusable location search bar with forward geocoding autocomplete.
 * Implemented using DIVs to avoid HTML form nesting issues when used inside parent forms.
 */
export const SearchLocation: React.FC<SearchLocationProps> = ({
  onLocationSelected,
  placeholder = 'Search area, street, landmark or city...',
  className = '',
}) => {
  const { searchAndSetLocation } = useLocation();
  const [query, setQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<GeocodedLocation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    try {
      const results = await locationService.geocodeAddress(query.trim());
      setSuggestions(results);
      setIsOpen(true);
      if (results.length > 0) {
        await searchAndSetLocation(query.trim());
        if (onLocationSelected) {
          onLocationSelected(results[0]);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSuggestion = async (item: GeocodedLocation) => {
    setQuery(item.shortName);
    setIsOpen(false);
    setSuggestions([]);
    await searchAndSetLocation(item.displayName);
    if (onLocationSelected) {
      onLocationSelected(item);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative flex-1 ${className}`}>
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!isOpen && e.target.value.length > 2) {
                // optionally debounce or open
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full pl-9 pr-8 py-2.5 text-xs bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none shadow-sm transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleSearch}
          disabled={isLoading || !query.trim()}
          className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-colors shrink-0 shadow-sm flex items-center gap-1.5"
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
        </button>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 z-[1100] max-h-60 overflow-y-auto py-1">
          {suggestions.map((item, idx) => (
            <button
              key={`${item.latitude}-${item.longitude}-${idx}`}
              type="button"
              onClick={() => handleSelectSuggestion(item)}
              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 transition-colors flex items-start gap-2 border-b border-slate-100 last:border-none"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{item.shortName}</p>
                <p className="text-[11px] text-slate-500 truncate">{item.displayName}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
