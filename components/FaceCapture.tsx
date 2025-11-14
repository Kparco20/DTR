'use client';

import { useState, useRef, useEffect } from 'react';
import {
  loadFaceModels,
  startCamera,
  stopCamera,
  captureFaceDescriptor,
  convertDescriptorToString,
} from '@/lib/faceRecognition';

interface FaceCaptureProps {
  onCapture: (faceDescriptor: string, image: string) => void;
  onCancel: () => void;
  title?: string;
}

export default function FaceCapture({
  onCapture,
  onCancel,
  title = 'Capture Your Face',
}: FaceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const initializeCamera = async () => {
      try {
        setLoading(true);
        setError('');
        await loadFaceModels();
        
        if (videoRef.current) {
          await startCamera(videoRef.current);
        }
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to initialize camera'
        );
        setLoading(false);
      }
    };

    initializeCamera();

    return () => {
      if (videoRef.current) {
        stopCamera(videoRef.current);
      }
    };
  }, []);

  const handleCaptureFace = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      setCapturing(true);
      setError('');

      // Capture face descriptor
      const descriptor = await captureFaceDescriptor(videoRef.current);

      if (!descriptor) {
        setError('Could not detect your face. Please try again.');
        setCapturing(false);
        return;
      }

      // Capture image from video
      const context = canvasRef.current.getContext('2d');
      if (context && videoRef.current.videoWidth > 0) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL('image/jpeg');

        // Convert descriptor to string for storage
        const descriptorString = convertDescriptorToString(descriptor);

        // Call parent callback
        onCapture(descriptorString, imageData);
        setSuccess(true);

        // Auto close after 2 seconds
        setTimeout(() => {
          stopCamera(videoRef.current!);
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to capture face');
      setCapturing(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-[#0b1220] p-8 rounded-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading face recognition...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-[#0b1220] p-8 rounded-lg text-center">
          <div className="text-4xl mb-4">✅</div>
          <p className="text-white text-lg">Face captured successfully!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#0b1220] p-8 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="relative mb-4">
          <video
            ref={videoRef}
            className="w-full h-64 rounded-lg bg-black object-cover"
            playsInline
          />
          <canvas ref={canvasRef} className="hidden" />

          <div className="absolute inset-0 border-4 border-blue-500 rounded-lg pointer-events-none opacity-50 flex items-center justify-center">
            <div className="text-center text-white">
              <p className="text-sm">Position your face in the frame</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onCancel}
            disabled={capturing}
            className="flex-1 button bg-gray-600 hover:bg-gray-700 py-2 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCaptureFace}
            disabled={capturing}
            className="flex-1 button-submit py-2 disabled:opacity-50"
          >
            {capturing ? 'Capturing...' : '📸 Capture Face'}
          </button>
        </div>
      </div>
    </div>
  );
}
