
// useQRCodeGenerator.ts
import QRCode from 'qrcode';

export const useQRCodeGenerator = () => {
  // Generate a QR code for a volume ID
  const generateQRCodeDataURL = async (text: string) => {
    try {
      const dataUrl = await QRCode.toDataURL(text, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 80
      });
      return dataUrl;
    } catch (error) {
      console.error("Error generating QR code:", error);
      return null;
    }
  };

  return { generateQRCodeDataURL };
};
