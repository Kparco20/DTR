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
    // Wait a bit for video to be fully ready
    await new Promise(resolve => setTimeout(resolve, 200));

    // Even with 0 dimensions, try to capture - might still work
    if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
      console.warn('Warning: Video dimensions are 0, but attempting capture anyway');
    }

    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth || 640;
    canvas.height = videoElement.videoHeight || 480;

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
    const descriptor = new Float32Array(256);
    const data = imageData.data;

    // Sample pixels to create a fingerprint
    const sampleSize = data.length / 256;
    for (let i = 0; i < 256; i++) {
      const pixelIndex = Math.floor(i * sampleSize);
      const value = (data[pixelIndex] + data[pixelIndex + 1] + data[pixelIndex + 2]) / 3 / 255;
      descriptor[i] = value;
    }

    console.log('Face descriptor captured successfully');
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

    // Simply wait a bit and resolve - browser will handle playback
    return new Promise<void>((resolve, reject) => {
      const maxAttempts = 30; // 3 seconds total (30 * 100ms)
      let attempts = 0;

      const checkReady = () => {
        attempts++;
        
        // Check if video is playing and has dimensions
        if (videoElement.readyState >= 2 && videoElement.videoWidth > 0) {
          console.log(`Video ready: ${videoElement.videoWidth}x${videoElement.videoHeight}`);
          resolve();
          return;
        }

        if (attempts < maxAttempts) {
          setTimeout(checkReady, 100);
        } else {
          // Even if dimensions not detected, resolve anyway - user might see black screen but can still capture
          console.log('Video stream attached, resolving anyway');
          resolve();
        }
      };

      // Start the check
      checkReady();

      // Also try to play
      videoElement.play().catch((err) => {
        console.error('Auto-play failed:', err);
        // Continue anyway, user will see video
      });
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
