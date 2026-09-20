"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificationController_1 = require("../controllers/verificationController");
const auth_1 = require("../middleware/auth");
const role_1 = require("../middleware/role");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// Host views their verification status
router.get('/status', verificationController_1.getHostVerificationStatus);
// Host self-verifies their documents / 1-click verification
router.post('/verify-me', (0, role_1.requireRole)('parking_holder', 'admin'), verificationController_1.verifyCurrentHost);
// Host resubmits verification documents
router.post('/resubmit', (0, role_1.requireRole)('parking_holder'), upload_1.uploadPrivate.fields([
    { name: 'idDocument', maxCount: 1 },
    { name: 'photos', maxCount: 6 },
]), verificationController_1.resubmitHostVerification);
// Admin approves or rejects host
router.post('/review', verificationController_1.updateHostVerification);
exports.default = router;
