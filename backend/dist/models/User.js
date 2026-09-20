"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
        type: String,
        enum: ['parking_needed', 'parking_holder', 'admin'],
        required: true,
        default: 'parking_needed',
    },
    profileImage: { type: String },
    isActive: { type: Boolean, default: true },
    verificationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: function () {
            return this.role === 'parking_holder' ? 'pending' : undefined;
        },
    },
    verificationNotes: { type: String },
    hostPreferences: {
        numberOfVehicles: { type: Number },
        parkingPreference: { type: String, enum: ['Covered', 'Open', 'Any'] },
        securityPreference: { type: String, enum: ['CCTV', 'Gated Parking', 'Both'] },
    },
    idDocument: {
        filename: { type: String },
        originalName: { type: String },
        path: { type: String },
        mimeType: { type: String },
        uploadedAt: { type: Date },
    },
    landmark: { type: String },
    cctvAvailable: { type: Boolean, default: false },
    gateAvailable: { type: Boolean, default: false },
    photos: [{ type: String }],
    upiId: { type: String, trim: true },
    settings: {
        searchRadiusKm: { type: Number, default: 5 },
        sortPreference: { type: String, enum: ['distance', 'price', 'rating', 'availability'], default: 'distance' },
        notificationsEnabled: { type: Boolean, default: true },
        theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
    },
}, {
    timestamps: true,
    toJSON: {
        transform(_doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            delete ret.passwordHash;
            // Never leak private ID document path in public user responses
            if (ret.idDocument) {
                ret.idDocument = {
                    hasUploaded: true,
                    originalName: ret.idDocument.originalName,
                    uploadedAt: ret.idDocument.uploadedAt,
                };
            }
            return ret;
        },
    },
});
// Index on role for fast role-based queries
UserSchema.index({ role: 1 });
exports.User = mongoose_1.default.model('User', UserSchema);
