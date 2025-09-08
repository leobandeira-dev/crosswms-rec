
import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  text: string;
  size?: number;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ text, size = 100 }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  
  useEffect(() => {
    const generateQR = async () => {
      try {
        const dataUrl = await QRCode.toDataURL(text, {
          width: size,
          margin: 1,
          errorCorrectionLevel: 'M'
        });
        setQrDataUrl(dataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };
    
    if (text) {
      generateQR();
    } else {
      // If no text, use a placeholder
      setQrDataUrl('');
    }
  }, [text, size]);
  
  if (!text) {
    return null;
  }
  
  if (!qrDataUrl) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <div className="animate-pulse bg-gray-200" style={{ width: size, height: size }} />
      </div>
    );
  }
  
  return <img src={qrDataUrl} alt={`QR Code: ${text}`} width={size} height={size} />;
};

export default QRCodeGenerator;
