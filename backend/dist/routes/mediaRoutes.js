"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mediaController_1 = require("../controllers/mediaController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public media (parking photos, profile avatars)
router.get('/public/:filename', mediaController_1.getPublicMedia);
// Private media (protected ID documents, vehicle photos, damage inspection photos)
router.get('/private/:filename', auth_1.authenticate, mediaController_1.getPrivateMedia);
exports.default = router;
