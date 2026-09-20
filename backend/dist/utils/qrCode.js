"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQrCodeDataUrl = generateQrCodeDataUrl;
const qrcode_1 = __importDefault(require("qrcode"));
/**
 * Generates dynamic Data URL string for a UPI payment link
 */
async function generateQrCodeDataUrl(data) {
    try {
        const dataUrl = await qrcode_1.default.toDataURL(data, {
            errorCorrectionLevel: 'M',
            margin: 2,
            width: 300,
            color: {
                dark: '#0f172a',
                light: '#ffffff',
            },
        });
        return dataUrl;
    }
    catch (err) {
        console.error('Failed to generate QR code data URL:', err);
        throw new Error('Failed to generate payment QR code');
    }
}
