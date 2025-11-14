'use client';

// Simple face recognition using canvas API
// Captures face data as image hash for comparison

export async function loadFaceModels() {
  // No models needed - using simple canvas-based approach
  console.log('Face recognition initialized');
}

export async function captureFaceDescriptor(
  videoElement: HTMLVideoElement
): Promise<Float32Array | null> {
  try {
    // Ensure video has loaded and has dimensions
    if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
      throw new Error('Video stream not ready. Please wait a moment and try again.');
    }

    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('Invalid canvas dimensions');
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    ctx.drawImage(videoElement, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (!imageData || imageData.data.length === 0) {
      throw new Error('Failed to capture image data from video');
    }

    // Create a simple hash/descriptor from pixel data
    // This is a simplified version - extracts pixel patterns
    const descriptor = new Float32Array(256);
    const data = imageData.data;

    // Sample pixels to create a fingerprint
    const sampleSize = data.length / 256;
    for (let i = 0; i < 256; i++) {
      const pixelIndex = Math.floor(i * sampleSize);
      const value = (data[pixelIndex] + data[pixelIndex + 1] + data[pixelIndex + 2]) / 3 / 255;
      descriptor[i] = value;
    }

    return descriptor;
  } catch (error) {
    console.error('Error capturing face:', error);
    throw error;
  }
}

export function compareFaceDescriptors(
  descriptor1: Float32Array,
  descriptor2: Float32Array
): number {
  // Calculate Euclidean distance between descriptors
  let sumSquaredDiff = 0;

  for (let i = 0; i < Math.min(descriptor1.length, descriptor2.length); i++) {
    const diff = descriptor1[i] - descriptor2[i];
    sumSquaredDiff += diff * diff;
  }

  return Math.sqrt(sumSquaredDiff);
}

export function isFaceMatch(distance: number, threshold: number = 0.5): boolean {
  // Lower distance = better match
  return distance < threshold;
}

export async function startCamera(videoElement: HTMLVideoElement) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'user',
      },
    });

    videoElement.srcObject = stream;
    videoElement.autoplay = true;
    videoElement.muted = true;
    videoElement.playsInline = true;

    // Ensure video plays after metadata is loaded
    return new Promise<void>((resolve, reject) => {
      const playPromise = videoElement.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Video playback started');
            resolve();
          })
          .catch((err) => {
            console.error('Video playback failed:', err);
            reject(new Error('Video playback failed: ' + err.message));
          });
      } else {
        // Fallback for older browsers
        videoElement.onloadedmetadata = () => {
          videoElement.play();
          resolve();
        };
      }
      
      // Timeout if video doesn't start
      setTimeout(() => reject(new Error('Camera timeout')), 5000);
    });
  } catch (error) {
    console.error('Failed to access camera:', error);
    throw new Error('Camera access denied. Please allow camera access.');
  }
}

export function stopCamera(videoElement: HTMLVideoElement) {
  const stream = videoElement.srcObject as MediaStream;
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
}

export function convertDescriptorToString(descriptor: Float32Array): string {
  return JSON.stringify(Array.from(descriptor));
}

export function convertStringToDescriptor(descriptorStr: string): Float32Array {
  return new Float32Array(JSON.parse(descriptorStr));
}
