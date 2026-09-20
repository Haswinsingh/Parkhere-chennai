"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDynamicUpiPayment = void 0;
const qrCode_1 = require("../utils/qrCode");
const generateDynamicUpiPayment = async (payload) => {
    const { payeeUpiId, payeeName, amount, transactionReference, transactionNote } = payload;
    // Standard UPI URI format:
    // upi://pay?pa=<upi_id>&pn=<name>&am=<amount>&cu=INR&tn=<note>&tr=<ref>
    const encodedName = encodeURIComponent(payeeName);
    const encodedNote = encodeURIComponent(transactionNote);
    const formattedAmount = amount.toFixed(2);
    const upiUri = `upi://pay?pa=${payeeUpiId}&pn=${encodedName}&am=${formattedAmount}&cu=INR&tn=${encodedNote}&tr=${transactionReference}`;
    const qrCodeDataUrl = await (0, qrCode_1.generateQrCodeDataUrl)(upiUri);
    return {
        upiUri,
        qrCodeDataUrl,
        transactionReference,
        amount,
        payeeUpiId,
        payeeName,
    };
};
exports.generateDynamicUpiPayment = generateDynamicUpiPayment;
