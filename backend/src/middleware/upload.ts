import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Use /tmp on Vercel serverless environment (read-only filesystem workaround)
const BASE_UPLOAD_PATH =
  process.env.VERCEL === '1'
    ? '/tmp/uploads'
    : path.resolve(__dirname, '../../uploads');

const PUBLIC_UPLOAD_PATH = path.join(BASE_UPLOAD_PATH, 'public');
const PRIVATE_UPLOAD_PATH = path.join(BASE_UPLOAD_PATH, 'private');

// Ensure directories exist
try {
  if (!fs.existsSync(PUBLIC_UPLOAD_PATH)) {
    fs.mkdirSync(PUBLIC_UPLOAD_PATH, { recursive: true });
  }
  if (!fs.existsSync(PRIVATE_UPLOAD_PATH)) {
    fs.mkdirSync(PRIVATE_UPLOAD_PATH, { recursive: true });
  }
} catch (dirErr) {
  console.warn('Could not initialize local upload folders:', dirErr);
}

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: JPG, PNG, WEBP, PDF`));
  }
};

const createStorage = (destinationFolder: string) => {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, destinationFolder);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  });
};

export const uploadPublic = multer({
  storage: createStorage(PUBLIC_UPLOAD_PATH),
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

export const uploadPrivate = multer({
  storage: createStorage(PRIVATE_UPLOAD_PATH),
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB limit
});

export { PUBLIC_UPLOAD_PATH, PRIVATE_UPLOAD_PATH };
