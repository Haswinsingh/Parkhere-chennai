import { ParkingSpace, IParkingSpace } from '../models/ParkingSpace';
import { calculateDistanceMeters } from '../utils/distance';

export interface NearbyParkingResult {
  parking: IParkingSpace;
  distanceMeters: number;
}

export const findNearbyParking = async (
  latitude: number,
  longitude: number,
  customRadiusMeters?: number,
  sortBy: 'distance' | 'price' | 'rating' | 'availability' = 'distance'
): Promise<NearbyParkingResult[]> => {
  // Initial radius is 5 km (5000 m) or custom radius
  let maxDistance = customRadiusMeters || 5000;

  const baseQuery: any = {
    status: 'open',
    availableSlots: { $gt: 0 },
    verified: true,
  };

  const executeGeoQuery = async (distance: number) => {
    return await ParkingSpace.find({
      ...baseQuery,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude], // [lng, lat]
          },
          $maxDistance: distance,
        },
      },
    }).populate('ownerId', 'name phone verificationStatus upiId');
  };

  let results = await executeGeoQuery(maxDistance);

  // If fewer than 3 results and using default 5km, expand to 10km (10,000m)
  if (results.length < 3 && !customRadiusMeters) {
    maxDistance = 10000;
    results = await executeGeoQuery(maxDistance);
  }

  // Calculate precise distance for each result and sort
  const mappedResults: NearbyParkingResult[] = results.map((space) => {
    const distanceMeters = calculateDistanceMeters(
      latitude,
      longitude,
      space.latitude,
      space.longitude
    );
    return {
      parking: space,
      distanceMeters,
    };
  });

  // Apply sorting
  mappedResults.sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.parking.pricePerHour - b.parking.pricePerHour;
      case 'rating':
        return b.parking.rating - a.parking.rating;
      case 'availability':
        return b.parking.availableSlots - a.parking.availableSlots;
      case 'distance':
      default:
        return a.distanceMeters - b.distanceMeters;
    }
  });

  return mappedResults;
};
