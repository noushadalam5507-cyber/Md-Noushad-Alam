/**
 * Native & Web Hardware Camera & Microphone Permission Manager
 * Supports Capacitor Camera plugin on Android/iOS and standard Web MediaDevices API
 */

export interface CameraPermissionResult {
  granted: boolean;
  canAskAgain: boolean;
  message?: string;
}

/**
 * Requests camera and microphone permissions at runtime
 * On Android (Capacitor/Codemagic APK): uses @capacitor/camera if available
 * On Web/WebView: uses navigator.mediaDevices.getUserMedia
 */
export async function requestRuntimeCameraPermissions(): Promise<CameraPermissionResult> {
  try {
    // 1. Try Capacitor Native Camera Permissions if running in Capacitor Native Android/iOS
    if (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform()) {
      try {
        const { Camera } = await import('@capacitor/camera');
        const status = await Camera.requestPermissions({
          permissions: ['camera', 'photos'],
        });

        if (status.camera === 'granted' || status.camera === 'limited') {
          return { granted: true, canAskAgain: true };
        }
      } catch (nativeErr) {
        console.warn('Capacitor Camera plugin permission request fallback:', nativeErr);
      }
    }

    // 2. Browser / WebView MediaDevices Runtime Permission Request
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        // Immediately release test stream so main camera components can attach it
        stream.getTracks().forEach((track) => track.stop());
        return { granted: true, canAskAgain: true };
      } catch (mediaErr: any) {
        // Test video-only if audio device is unavailable
        try {
          const videoOnlyStream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          videoOnlyStream.getTracks().forEach((track) => track.stop());
          return { granted: true, canAskAgain: true };
        } catch (videoErr: any) {
          const isDenied =
            videoErr.name === 'NotAllowedError' ||
            videoErr.name === 'PermissionDeniedError';
          return {
            granted: false,
            canAskAgain: !isDenied,
            message: isDenied
              ? 'Camera permission was denied. Please allow camera in device or app settings.'
              : 'Camera hardware is busy or not available.',
          };
        }
      }
    }

    return {
      granted: false,
      canAskAgain: false,
      message: 'Camera not supported in this browser/device.',
    };
  } catch (err: any) {
    return {
      granted: false,
      canAskAgain: true,
      message: err?.message || 'Error requesting camera permissions.',
    };
  }
}

/**
 * Opens immediate camera video and audio stream with high compatibility
 */
export async function getImmediateCameraStream(
  facingMode: 'user' | 'environment' = 'user',
  isReel: boolean = false
): Promise<MediaStream> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Camera hardware access is not supported on this device.');
  }

  // Optimized constraints for low latency & instant open
  const videoConstraints: MediaTrackConstraints = {
    facingMode: { ideal: facingMode },
    width: { ideal: isReel ? 720 : 1080 },
    height: { ideal: isReel ? 1280 : 1080 },
  };

  try {
    // Attempt combined video + audio
    return await navigator.mediaDevices.getUserMedia({
      video: videoConstraints,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      },
    });
  } catch (audioVideoErr) {
    console.warn('Audio+Video stream request failed, falling back to Video-only stream:', audioVideoErr);
    // Fallback: video only
    return await navigator.mediaDevices.getUserMedia({
      video: videoConstraints,
    });
  }
}

/**
 * Take native photo using Capacitor Camera or fallback
 */
export async function takeNativeOrWebPhoto(): Promise<string | null> {
  if (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform()) {
    try {
      const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });
      return image.dataUrl || null;
    } catch (e) {
      console.warn('Native camera capture failed, using web stream capture fallback:', e);
    }
  }
  return null;
}
