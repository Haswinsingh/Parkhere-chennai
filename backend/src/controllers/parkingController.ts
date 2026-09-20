import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { ParkingSpace } from '../models/ParkingSpace';
import { findNearbyParking } from '../services/geoService';

export const createParkingSpace = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user!;

    if (user.role !== 'parking_holder' && user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Only registered Parking Holders can list parking spaces.',
      });
      return;
    }

    // Business rule: Only verified hosts can list bookable parking
    if (user.verificationStatus !== 'approved' && user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Your host account verification is still pending. You can publish parking spaces once approved.',
        code: 'HOST_NOT_VERIFIED',
      });
      return;
    }

    const {
      name,
      address,
      latitude,
      longitude,
      totalSlots,
      pricePerHour,
      parkingType,
      landmark,
      cctvAvailable,
      gateAvailable,
      amenities,
      openingTime,
      closingTime,
    } = req.body;

    if (!name || !address || latitude === undefined || longitude === undefined || !totalSlots || pricePerHour === undefined) {
      res.status(400).json({
        success: false,
        message: 'Please provide parking name, address, coordinates, total slots, and price per hour.',
      });
      return;
    }

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);

    if (isNaN(latNum) || isNaN(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      res.status(400).json({
        success: false,
        message: 'Invalid latitude or longitude coordinates provided.',
      });
      return;
    }

    const slotsNum = parseInt(totalSlots, 10);
    const priceNum = parseFloat(pricePerHour);

    if (slotsNum <= 0 || priceNum < 0) {
      res.status(400).json({
        success: false,
        message: 'Total slots must be greater than 0 and price cannot be negative.',
      });
      return;
    }

    // Handle photos from multer
    const files = req.files as Express.Multer.File[] | undefined;
    const photos = files && files.length > 0 ? files.map((f) => f.filename) : (req.body.photos || []);

    if (photos.length < 2) {
      res.status(400).json({
        success: false,
        message: 'Please upload at least 2 parking photos showing entrance and parking area.',
      });
      return;
    }

    let parsedAmenities: string[] = [];
    if (typeof amenities === 'string') {
      try {
        parsedAmenities = JSON.parse(amenities);
      } catch {
        parsedAmenities = amenities.split(',').map((s) => s.trim());
      }
    } else if (Array.isArray(amenities)) {
      parsedAmenities = amenities;
    }

    const newSpace = await ParkingSpace.create({
      ownerId: user._id,
      name: name.trim(),
      address: address.trim(),
      location: {
        type: 'Point',
        coordinates: [lngNum, latNum], // GeoJSON standard: [lng, lat]
      },
      latitude: latNum,
      longitude: lngNum,
      totalSlots: slotsNum,
      availableSlots: slotsNum,
      pricePerHour: priceNum,
      status: 'open',
      parkingType: parkingType || 'Open',
      landmark: landmark ? landmark.trim() : 'Nearby',
      cctvAvailable: cctvAvailable === 'true' || cctvAvailable === true,
      gateAvailable: gateAvailable === 'true' || gateAvailable === true,
      amenities: parsedAmenities,
      photos,
      openingTime: openingTime || '00:00',
      closingTime: closingTime || '23:59',
      verified: true,
    });

    res.status(201).json({
      success: true,
      message: 'Parking space listed successfully and is now active.',
      data: {
        parking: newSpace,
      },
    });
  } catch (err: any) {
    console.error('Error creating parking space:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to create parking space.',
    });
  }
};

export const getMyParkingSpaces = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user!;
    const spaces = await ParkingSpace.find({ ownerId: user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        parkingSpaces: spaces,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to load your parking spaces.',
    });
  }
};

export const getParkingSpaceById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const space = await ParkingSpace.findById(id).populate('ownerId', 'name phone verificationStatus upiId');

    if (!space) {
      res.status(404).json({
        success: false,
        message: 'Parking space not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        parking: space,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve parking space details.',
    });
  }
};

export const updateParkingSpace = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const space = await ParkingSpace.findById(id);
    if (!space) {
      res.status(404).json({
        success: false,
        message: 'Parking space not found.',
      });
      return;
    }

    if (space.ownerId.toString() !== user._id.toString() && user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this parking space.',
      });
      return;
    }

    const {
      name,
      address,
      totalSlots,
      availableSlots,
      pricePerHour,
      status,
      parkingType,
      landmark,
      cctvAvailable,
      gateAvailable,
      openingTime,
      closingTime,
    } = req.body;

    if (name) space.name = name.trim();
    if (address) space.address = address.trim();
    if (parkingType) space.parkingType = parkingType;
    if (landmark) space.landmark = landmark.trim();
    if (openingTime) space.openingTime = openingTime;
    if (closingTime) space.closingTime = closingTime;
    if (status && ['open', 'closed'].includes(status)) space.status = status;
    if (cctvAvailable !== undefined) space.cctvAvailable = cctvAvailable === 'true' || cctvAvailable === true;
    if (gateAvailable !== undefined) space.gateAvailable = gateAvailable === 'true' || gateAvailable === true;

    if (totalSlots !== undefined) {
      const parsedTotal = parseInt(totalSlots, 10);
      if (parsedTotal >= 0) {
        space.totalSlots = parsedTotal;
      }
    }

    if (availableSlots !== undefined) {
      const parsedAvailable = parseInt(availableSlots, 10);
      if (parsedAvailable >= 0) {
        space.availableSlots = Math.min(parsedAvailable, space.totalSlots);
      }
    }

    if (pricePerHour !== undefined) {
      const parsedPrice = parseFloat(pricePerHour);
      if (parsedPrice >= 0) {
        space.pricePerHour = parsedPrice;
      }
    }

    await space.save();

    res.status(200).json({
      success: true,
      message: 'Parking space updated successfully.',
      data: {
        parking: space,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to update parking space.',
    });
  }
};

export const deleteParkingSpace = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const space = await ParkingSpace.findById(id);
    if (!space) {
      res.status(404).json({
        success: false,
        message: 'Parking space not found.',
      });
      return;
    }

    if (space.ownerId.toString() !== user._id.toString() && user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this parking space.',
      });
      return;
    }

    await ParkingSpace.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Parking space deleted successfully.',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete parking space.',
    });
  }
};

export const getNearbyParkingSpaces = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { lat, lng, radius, sort } = req.query;

    if (!lat || !lng) {
      res.status(400).json({
        success: false,
        message: 'Latitude and longitude coordinates are required for nearby parking search.',
      });
      return;
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);

    if (isNaN(latitude) || isNaN(longitude)) {
      res.status(400).json({
        success: false,
        message: 'Invalid coordinate parameters.',
      });
      return;
    }

    const radiusMeters = radius ? parseInt(radius as string, 10) * 1000 : undefined;
    const sortBy = (sort as 'distance' | 'price' | 'rating' | 'availability') || 'distance';

    const results = await findNearbyParking(latitude, longitude, radiusMeters, sortBy);

    res.status(200).json({
      success: true,
      data: {
        results,
        count: results.length,
      },
      message: results.length === 0 ? 'No parking spaces available nearby.' : undefined,
    });
  } catch (err: any) {
    console.error('Nearby parking search error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve nearby parking spaces.',
    });
  }
};
