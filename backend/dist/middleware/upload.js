"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRIVATE_UPLOAD_PATH = exports.PUBLIC_UPLOAD_PATH = exports.uploadPrivate = exports.uploadPublic = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const BASE_UPLOAD_PATH = path_1.default.resolve(__dirname, '../../uploads');
const PUBLIC_UPLOAD_PATH = path_1.default.join(BASE_UPLOAD_PATH, 'public');
exports.PUBLIC_UPLOAD_PATH = PUBLIC_UPLOAD_PATH;
const PRIVATE_UPLOAD_PATH = path_1.default.join(BASE_UPLOAD_PATH, 'private');
exports.PRIVATE_UPLOAD_PATH = PRIVATE_UPLOAD_PATH;
// Ensure directories exist
if (!fs_1.default.existsSync(PUBLIC_UPLOAD_PATH)) {
    fs_1.default.mkdirSync(PUBLIC_UPLOAD_PATH, { recursive: true });
}
if (!fs_1.default.existsSync(PRIVATE_UPLOAD_PATH)) {
    fs_1.default.mkdirSync(PRIVATE_UPLOAD_PATH, { recursive: true });
}
// Allowed MIME types
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
];
const fileFilter = (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: JPG, PNG, WEBP, PDF`));
    }
};
const createStorage = (destinationFolder) => {
    return multer_1.default.diskStorage({
        destination: (_req, _file, cb) => {
            cb(null, destinationFolder);
        },
        filename: (_req, file, cb) => {
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            const ext = path_1.default.extname(file.originalname).toLowerCase();
            cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
    });
};
exports.uploadPublic = (0, multer_1.default)({
    storage: createStorage(PUBLIC_UPLOAD_PATH),
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});
exports.uploadPrivate = (0, multer_1.default)({
    storage: createStorage(PRIVATE_UPLOAD_PATH),
    fileFilter,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB limit
});
