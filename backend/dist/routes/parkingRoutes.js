"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const parkingController_1 = require("../controllers/parkingController");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
// Nearby parking search (public or authenticated)
router.get('/nearby', parkingController_1.getNearbyParkingSpaces);
// Owner parking spaces
router.get('/my-spaces', auth_1.authenticate, parkingController_1.getMyParkingSpaces);
// Single parking space details
router.get('/:id', parkingController_1.getParkingSpaceById);
// Create parking space (Parking Holder only)
router.post('/', auth_1.authenticate, upload_1.uploadPublic.array('photos', 6), parkingController_1.createParkingSpace);
// Update parking space (Owner only)
router.patch('/:id', auth_1.authenticate, upload_1.uploadPublic.array('photos', 6), parkingController_1.updateParkingSpace);
// Delete parking space (Owner only)
router.delete('/:id', auth_1.authenticate, parkingController_1.deleteParkingSpace);
exports.default = router;
