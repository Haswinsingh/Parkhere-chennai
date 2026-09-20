import QRCode from 'qrcode';

/**
 * Generates dynamic Data URL string for a UPI payment link
 */
export async function generateQrCodeDataUrl(data: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 300,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR code data URL:', err);
    throw new Error('Failed to generate payment QR code');
  }
}
