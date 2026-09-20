import { useLocation } from '../context/LocationContext';

/**
 * Universal hook for consuming location state and actions across components
 */
export const useUserLocation = () => {
  return useLocation();
};
