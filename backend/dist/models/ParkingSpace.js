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
exports.ParkingSpace = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ParkingSpaceSchema = new mongoose_1.Schema({
    ownerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
            required: true,
        },
        coordinates: {
            type: [Number], // [lng, lat]
            required: true,
        },
    },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    totalSlots: { type: Number, required: true, min: 1 },
    availableSlots: { type: Number, required: true, min: 0 },
    pricePerHour: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['open', 'closed'], default: 'open', index: true },
    parkingType: {
        type: String,
        enum: ['Covered', 'Open', 'Garage', 'Basement'],
        default: 'Open',
    },
    landmark: { type: String, required: true, trim: true },
    cctvAvailable: { type: Boolean, default: false },
    gateAvailable: { type: Boolean, default: false },
    amenities: [{ type: String }],
    photos: {
        type: [String],
        validate: {
            validator: function (val) {
                return val.length >= 2;
            },
            message: 'A minimum of 2 parking photos is required.',
        },
    },
    openingTime: { type: String, default: '00:00' },
    closingTime: { type: String, default: '23:59' },
    verified: { type: Boolean, default: false, index: true },
    rating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 0 },
}, {
    timestamps: true,
    toJSON: {
        transform(_doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
});
// 2dsphere index for true native geospatial distance queries
ParkingSpaceSchema.index({ location: '2dsphere' });
ParkingSpaceSchema.index({ ownerId: 1, status: 1 });
exports.ParkingSpace = mongoose_1.default.model('ParkingSpace', ParkingSpaceSchema);
