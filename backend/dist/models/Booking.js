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
exports.Booking = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const BookingSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    parkingId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'ParkingSpace', required: true, index: true },
    ownerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true, index: true },
    duration: { type: Number, required: true, min: 0.5 },
    pricePerHour: { type: Number, required: true, min: 0 },
    baseAmount: { type: Number, required: true, min: 0 },
    overtimeAmount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
        type: String,
        enum: ['upcoming', 'arrived', 'active', 'completed', 'cancelled'],
        default: 'upcoming',
        index: true,
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'cancelled'],
        default: 'pending',
        index: true,
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'upi'],
    },
    arrivalDetails: {
        arrivedAt: { type: Date },
        distanceMeters: { type: Number },
        userLocation: {
            latitude: { type: Number },
            longitude: { type: Number },
        },
        vehiclePhoto: { type: String },
        damageReported: { type: Boolean, default: false },
        damageDescription: { type: String },
        damagePhotos: [{ type: String }],
    },
    verifiedAt: { type: Date },
    verifiedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    parkingStartTime: { type: Date },
    parkingEndTime: { type: Date },
    tenMinuteWarningSent: { type: Boolean, default: false, index: true },
    cancelReason: { type: String },
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
BookingSchema.index({ userId: 1, status: 1 });
BookingSchema.index({ ownerId: 1, status: 1 });
BookingSchema.index({ parkingId: 1, startTime: 1, endTime: 1 });
exports.Booking = mongoose_1.default.model('Booking', BookingSchema);
