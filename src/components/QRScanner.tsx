import React, { useState, useRef, useEffect } from 'react';
import { Camera, QrCode, CheckCircle, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface QRScannerProps {
  onScanSuccess: (data: string) => void;
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const [scanResult, setScanResult] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
      }
    } catch (err) {
      setError('Unable to access camera. Please ensure camera permissions are granted.');
      console.error('Camera access error:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  // Mock QR code detection - in real app, you'd use a QR code library like jsQR
  const simulateQRScan = () => {
    // Simulate successful scan after 2 seconds
    setTimeout(() => {
      const mockQRData = 'ATTENDANCE_SESSION_' + Math.random().toString(36).substr(2, 9);
      setScanResult(mockQRData);
      onScanSuccess(mockQRData);
    }, 2000);
  };

  const handleManualScan = () => {
    simulateQRScan();
  };

  const handleRetry = () => {
    setScanResult('');
    setError('');
    startCamera();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Scan QR Code</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Scanner Area */}
          <div className="space-y-4">
            {!scanResult ? (
              <>
                {/* Camera Feed */}
                <div className="relative">
                  <div className="aspect-square bg-gray-900 rounded-lg overflow-hidden relative">
                    {isScanning && !error ? (
                      <>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        {/* Scanning Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-48 h-48 border-2 border-white rounded-lg relative">
                            <div className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-student-primary rounded-tl"></div>
                            <div className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-student-primary rounded-tr"></div>
                            <div className="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-student-primary rounded-bl"></div>
                            <div className="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-student-primary rounded-br"></div>
                            {/* Animated scanning line */}
                            <div className="absolute top-0 left-0 w-full h-0.5 bg-student-primary animate-pulse"></div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center text-white">
                          <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p className="text-sm">
                            {error || 'Initializing camera...'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Instructions */}
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Position the QR code within the frame
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Make sure the code is well-lit and clearly visible
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {error ? (
                    <Button onClick={handleRetry} className="w-full btn-student">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Retry Camera Access
                    </Button>
                  ) : (
                    <Button onClick={handleManualScan} className="w-full btn-student">
                      <QrCode className="w-4 h-4 mr-2" />
                      Simulate Scan (Demo)
                    </Button>
                  )}
                  
                  <Button variant="outline" onClick={onClose} className="w-full">
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              /* Success State */
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Attendance Marked Successfully!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Your attendance has been recorded for this session.
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-green-800 font-mono break-all">
                    Session ID: {scanResult}
                  </p>
                </div>

                <Button onClick={onClose} className="w-full btn-student">
                  Done
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};