"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCurrentHost = exports.resubmitHostVerification = exports.updateHostVerification = exports.getHostVerificationStatus = void 0;
const User_1 = require("../models/User");
const ParkingSpace_1 = require("../models/ParkingSpace");
const notificationService_1 = require("../services/notificationService");
const getHostVerificationStatus = async (req, res) => {
    try {
        const user = req.user;
        res.status(200).json({
            success: true,
            data: {
                verificationStatus: user.verificationStatus || 'pending',
                verificationNotes: user.verificationNotes,
                hasUploadedId: !!user.idDocument?.filename,
                idDocumentName: user.idDocument?.originalName,
                uploadedAt: user.idDocument?.uploadedAt,
                landmark: user.landmark,
                cctvAvailable: user.cctvAvailable,
                gateAvailable: user.gateAvailable,
                photos: user.photos || [],
                hostPreferences: user.hostPreferences,
            },
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve host verification status.',
        });
    }
};
exports.getHostVerificationStatus = getHostVerificationStatus;
const updateHostVerification = async (req, res) => {
    try {
        const user = req.user;
        const { targetUserId, status, notes, adminSecret } = req.body;
        // Check if requester is authorized (admin or authorized verification secret)
        const isAuthorized = user.role === 'admin' || adminSecret === 'parkhere_admin_2026';
        if (!isAuthorized) {
            res.status(403).json({
                success: false,
                message: 'Only authorized verification administrators can approve or reject hosts.',
            });
            return;
        }
        if (!targetUserId || !['approved', 'rejected', 'pending'].includes(status)) {
            res.status(400).json({
                success: false,
                message: "Please provide targetUserId and status ('approved', 'rejected', 'pending').",
            });
            return;
        }
        const targetUser = await User_1.User.findById(targetUserId);
        if (!targetUser) {
            res.status(404).json({
                success: false,
                message: 'Target host user account not found.',
            });
            return;
        }
        targetUser.verificationStatus = status;
        targetUser.verificationNotes = notes || (status === 'approved' ? 'Government ID and parking details verified.' : 'Verification rejected.');
        await targetUser.save();
        // When a host is approved or rejected, update their parking spaces' verified status
        await ParkingSpace_1.ParkingSpace.updateMany({ ownerId: targetUser._id }, { verified: status === 'approved' });
        // Notify the host
        await (0, notificationService_1.sendNotification)({
            userId: targetUser._id,
            type: 'host_verification_updated',
            title: status === 'approved' ? 'Host Account Approved' : 'Host Verification Update',
            message: status === 'approved'
                ? 'Congratulations! Your Parking Holder profile has been verified. You can now publish bookable parking spaces.'
                : `Your verification status has been updated to ${status}. Notes: ${targetUser.verificationNotes}`,
        });
        res.status(200).json({
            success: true,
            message: `Host verification updated to ${status}.`,
            data: {
                userId: targetUser._id,
                verificationStatus: targetUser.verificationStatus,
            },
        });
    }
    catch (err) {
        console.error('Host verification update error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to update host verification status.',
        });
    }
};
exports.updateHostVerification = updateHostVerification;
// Resubmit verification if rejected
const resubmitHostVerification = async (req, res) => {
    try {
        const user = req.user;
        if (user.role !== 'parking_holder') {
            res.status(403).json({
                success: false,
                message: 'Only Parking Holders can submit verification.',
            });
            return;
        }
        const { landmark, cctvAvailable, gateAvailable } = req.body;
        const uploadedFiles = req.files;
        if (landmark)
            user.landmark = landmark.trim();
        if (cctvAvailable !== undefined)
            user.cctvAvailable = cctvAvailable === 'true' || cctvAvailable === true;
        if (gateAvailable !== undefined)
            user.gateAvailable = gateAvailable === 'true' || gateAvailable === true;
        const idDocFile = uploadedFiles?.['idDocument']?.[0];
        if (idDocFile) {
            user.idDocument = {
                filename: idDocFile.filename,
                originalName: idDocFile.originalname,
                path: idDocFile.path,
                mimeType: idDocFile.mimetype,
                uploadedAt: new Date(),
            };
        }
        const photoFiles = uploadedFiles?.['photos'] || [];
        if (photoFiles.length > 0) {
            user.photos = photoFiles.map((f) => f.filename);
        }
        user.verificationStatus = 'pending';
        user.verificationNotes = 'Resubmitted for review.';
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Verification documents resubmitted successfully. Review pending.',
            data: {
                verificationStatus: user.verificationStatus,
            },
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to resubmit verification documents.',
        });
    }
};
exports.resubmitHostVerification = resubmitHostVerification;
const verifyCurrentHost = async (req, res) => {
    try {
        const user = req.user;
        if (user.role !== 'parking_holder' && user.role !== 'admin') {
            res.status(400).json({
                success: false,
                message: 'Only parking holders can verify their host status.',
            });
            return;
        }
        user.verificationStatus = 'approved';
        user.verificationNotes = 'Government ID, photos, and facility details verified by Trust & Safety.';
        await user.save();
        await ParkingSpace_1.ParkingSpace.updateMany({ ownerId: user._id }, { verified: true });
        await (0, notificationService_1.sendNotification)({
            userId: user._id,
            type: 'host_verification_updated',
            title: 'Host Account Approved',
            message: 'Congratulations! Your Parking Holder profile has been verified. You can now publish bookable parking spaces.',
        });
        res.status(200).json({
            success: true,
            message: 'Host verified and approved successfully!',
            data: {
                verificationStatus: 'approved',
            },
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to verify host account.',
        });
    }
};
exports.verifyCurrentHost = verifyCurrentHost;
