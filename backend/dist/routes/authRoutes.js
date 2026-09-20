"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
// Parking Holder registration may include idDocument and parking photos
router.post('/register', upload_1.uploadPrivate.fields([
    { name: 'idDocument', maxCount: 1 },
    { name: 'photos', maxCount: 6 },
]), authController_1.register);
router.post('/login', authController_1.login);
router.get('/me', auth_1.authenticate, authController_1.getMe);
router.post('/logout', authController_1.logout);
exports.default = router;
