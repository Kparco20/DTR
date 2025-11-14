'use client';

import { useState, useRef, useEffect } from 'react';
import {
  convertDescriptorToString,
} from '@/lib/faceRecognition';

interface FaceScannerProps {
  onCapture: (faceDescriptor: string, image: string) => void;
  onCancel: () => void;
  title?: string;
}

export default function FaceScanner({
  onCapture,
  onCancel,
  title = 'Scan Your Face',
}: FaceScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState('initializing');
  const [error, setError] = useState<string>('');
  const [capturing, setCapturing] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [cameraConfirmed, setCameraConfirmed] = useState(false);
  const [showCameraCheck, setShowCameraCheck] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startScanning = async () => {
      try {
        setStatus('initializing');
        setError('');
        setShowCameraCheck(true);

        // Request camera access
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          // Verify camera is actually streaming
          const checkCameraStream = () => {
            if (
              videoRef.current &&
              videoRef.current.srcObject &&
              (videoRef.current.srcObject as MediaStream).getTracks().length > 0
            ) {
              const videoTrack = (videoRef.current.srcObject as MediaStream)
                .getVideoTracks()[0];
              if (videoTrack && videoTrack.readyState === 'live') {
                console.log('✅ Camera is live and ready');
                setCameraConfirmed(true);
              }
            }
          };

          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(err => {
              console.error('Play error:', err);
            });
            checkCameraStream();
          };

          // Also check periodically
          const checkInterval = setInterval(checkCameraStream, 500);

          // Timeout if video doesn't load
          const timeout = setTimeout(() => {
            clearInterval(checkInterval);
            if (cameraConfirmed) {
              setStatus('ready');
            } else {
              setStatus('ready');
            }
          }, 3000);

          return () => {
            clearInterval(checkInterval);
            clearTimeout(timeout);
          };
        }
      } catch (err) {
        console.error('Camera error:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Camera access denied. Please allow camera permissions.'
        );
        setStatus('error');
        setShowCameraCheck(false);
      }
    };

    startScanning();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraConfirmed]);

  const captureFace = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      setCapturing(true);
      setError('');

      const canvas = canvasRef.current;
      const video = videoRef.current;

      // Set canvas dimensions
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0);

      // Simulate scanning progress
      for (let i = 0; i <= 100; i += 20) {
        setScanProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Get image data
      const imageData = canvas.toDataURL('image/jpeg', 0.8);

      // Extract face descriptor from canvas
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Create descriptor from pixel data
      const descriptor = new Float32Array(256);
      const sampleSize = data.length / 256;

      for (let i = 0; i < 256; i++) {
        const pixelIndex = Math.floor(i * sampleSize);
        const value = (data[pixelIndex] + data[pixelIndex + 1] + data[pixelIndex + 2]) / 3 / 255;
        descriptor[i] = value;
      }

      const descriptorString = convertDescriptorToString(descriptor);

      setScanProgress(100);
      setStatus('success');

      // Wait a moment to show success
      await new Promise(resolve => setTimeout(resolve, 500));

      // Call parent callback
      onCapture(descriptorString, imageData);

      // Close modal after a moment
      setTimeout(() => {
        if (videoRef.current?.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
        }
      }, 1000);
    } catch (err) {
      console.error('Capture error:', err);
      setError(err instanceof Error ? err.message : 'Failed to capture face');
      setCapturing(false);
      setScanProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-[#0f1419] to-[#0a0e16] p-8 rounded-2xl max-w-md w-full border border-blue-500/30 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">{title}</h2>

        {status === 'initializing' && (
          <div className="space-y-4">
            <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent"></div>
            </div>
            <p className="text-blue-300 text-sm text-center">Loading camera...</p>
          </div>
        )}

        {showCameraCheck && status === 'initializing' && (
          <div className="space-y-4">
            <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-4">
              <p className="text-blue-200 text-sm">
                {cameraConfirmed ? (
                  <>
                    <span className="font-semibold">✅ Camera is ready!</span>
                    <br />
                    Your camera has been verified and is ready to scan.
                  </>
                ) : (
                  <>
                    <span className="font-semibold">Checking camera...</span>
                    <br />
                    Verifying that your camera is working properly.
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        {status === 'ready' && (
          <div className="space-y-4">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden border-2 border-blue-500/50">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
                style={{ transform: 'scaleX(-1)' }}
              />

              {/* Scanning frame overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-40 h-56 border-2 border-blue-500 rounded-3xl">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-green-400"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-green-400"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-green-400"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-green-400"></div>

                  {/* Animated scanning line */}
                  <div
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse"
                    style={{
                      top: '50%',
                      animation: 'scan 2s linear infinite',
                    }}
                  ></div>
                </div>
              </div>

              <p className="absolute bottom-4 left-4 right-4 text-blue-300 text-xs text-center">
                Position your face in the frame
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                disabled={capturing}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={captureFace}
                disabled={capturing}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {capturing ? 'Scanning...' : '📸 Scan Face'}
              </button>
            </div>
          </div>
        )}

        {capturing && (
          <div className="space-y-4">
            <div className="aspect-video bg-black rounded-lg relative overflow-hidden border-2 border-blue-500">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
                style={{ transform: 'scaleX(-1)' }}
              />

              {/* Progress overlay */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin mx-auto mb-4"></div>
                  <p className="text-blue-300 font-semibold">Scanning face...</p>
                  <p className="text-blue-400 text-sm mt-1">{scanProgress}%</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 text-center">
            <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4 animate-bounce">✅</div>
                <p className="text-green-400 font-semibold">Face Scanned Successfully!</p>
              </div>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
            <button
              onClick={onCancel}
              className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }
      `}</style>
    </div>
  );
}
