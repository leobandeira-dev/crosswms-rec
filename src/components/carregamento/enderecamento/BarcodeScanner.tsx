import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, QrCode, Barcode } from 'lucide-react';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string, type: 'qr' | 'barcode') => void;
  scanType: 'qr' | 'barcode' | 'both';
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  isOpen,
  onClose,
  onScan,
  scanType
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Usar câmera traseira no mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanning(true);
      }
    } catch (err) {
      console.error('Erro ao acessar câmera:', err);
      setError('Não foi possível acessar a câmera. Verifique as permissões.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Aqui você integraria com uma biblioteca de leitura de QR/Barcode
    // Por exemplo: QuaggaJS, ZXing, ou @zxing/library
    // Por enquanto, vamos simular a leitura
    simulateScan();
  };

  const simulateScan = () => {
    // Simulação de leitura - em produção, use uma biblioteca real
    const mockCodes = {
      qr: ['QR123456', 'QR789012', 'QR345678'],
      barcode: ['1234567890123', '9876543210987', '5556667778889']
    };

    const codes = scanType === 'both' 
      ? [...mockCodes.qr, ...mockCodes.barcode]
      : mockCodes[scanType];

    const randomCode = codes[Math.floor(Math.random() * codes.length)];
    const detectedType = mockCodes.qr.includes(randomCode) ? 'qr' : 'barcode';
    
    onScan(randomCode, detectedType);
  };

  const handleManualInput = () => {
    const code = prompt('Digite o código manualmente:');
    if (code) {
      const type = code.length > 10 ? 'barcode' : 'qr';
      onScan(code, type);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              {scanType === 'qr' ? <QrCode className="h-6 w-6" /> : 
               scanType === 'barcode' ? <Barcode className="h-6 w-6" /> : 
               <Camera className="h-6 w-6" />}
              Scanner de {scanType === 'qr' ? 'QR Code' : 
                        scanType === 'barcode' ? 'Código de Barras' : 
                        'Códigos'}
            </h2>
            <p className="text-gray-600 mt-1">
              Aponte a câmera para o código
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Camera View */}
        <div className="relative bg-black">
          <video
            ref={videoRef}
            className="w-full h-64 object-cover"
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            className="hidden"
          />
          
          {/* Scanning Overlay */}
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-2 border-blue-500 rounded-lg w-48 h-32 animate-pulse">
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 animate-pulse"></div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <Button
              onClick={captureFrame}
              disabled={!isScanning}
              className="flex-1 h-12 text-base"
            >
              <Camera className="mr-2 h-5 w-5" />
              Capturar Código
            </Button>
            <Button
              onClick={handleManualInput}
              variant="outline"
              className="flex-1 h-12 text-base"
            >
              <Barcode className="mr-2 h-5 w-5" />
              Digitar Manualmente
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600">
            {scanType === 'qr' && 'Aponte para um QR Code'}
            {scanType === 'barcode' && 'Aponte para um código de barras'}
            {scanType === 'both' && 'Aponte para QR Code ou código de barras'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;
