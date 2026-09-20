import { generateQrCodeDataUrl } from '../utils/qrCode';

export interface DynamicUpiPayload {
  payeeUpiId: string;
  payeeName: string;
  amount: number;
  transactionReference: string;
  transactionNote: string;
}

export interface GeneratedUpiPayment {
  upiUri: string;
  qrCodeDataUrl: string;
  transactionReference: string;
  amount: number;
  payeeUpiId: string;
  payeeName: string;
}

export const generateDynamicUpiPayment = async (
  payload: DynamicUpiPayload
): Promise<GeneratedUpiPayment> => {
  const { payeeUpiId, payeeName, amount, transactionReference, transactionNote } = payload;

  // Standard UPI URI format:
  // upi://pay?pa=<upi_id>&pn=<name>&am=<amount>&cu=INR&tn=<note>&tr=<ref>
  const encodedName = encodeURIComponent(payeeName);
  const encodedNote = encodeURIComponent(transactionNote);
  const formattedAmount = amount.toFixed(2);

  const upiUri = `upi://pay?pa=${payeeUpiId}&pn=${encodedName}&am=${formattedAmount}&cu=INR&tn=${encodedNote}&tr=${transactionReference}`;

  const qrCodeDataUrl = await generateQrCodeDataUrl(upiUri);

  return {
    upiUri,
    qrCodeDataUrl,
    transactionReference,
    amount,
    payeeUpiId,
    payeeName,
  };
};
