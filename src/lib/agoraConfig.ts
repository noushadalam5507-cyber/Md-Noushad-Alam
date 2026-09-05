/// <reference types="vite/client" />

import AgoraRTC, {
  IAgoraRTCClient,
  ILocalAudioTrack,
  ILocalVideoTrack,
  IRemoteAudioTrack,
  IRemoteVideoTrack,
  IAgoraRTCRemoteUser,
  UID,
} from 'agora-rtc-sdk-ng';

/**
 * Official Agora RTC Configuration
 * App ID: e1d2afd25ca545198595230e1b039339
 */
export interface AgoraAppConfig {
  appId: string;
  mode: 'rtc' | 'live';
  codec: 'vp8' | 'h264' | 'vp9';
  channelProfile: number;
}

const env =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env
    : ({} as Record<string, string>);

export const AGORA_CONFIG: AgoraAppConfig = {
  // Official Agora App ID
  appId: env.VITE_AGORA_APP_ID || 'e1d2afd25ca545198595230e1b039339',
  mode: 'rtc',
  codec: 'vp8',
  channelProfile: 0, // 0 for communication/rtc mode
};

// Disable verbose Agora logs in production for clean console
if (typeof window !== 'undefined') {
  try {
    AgoraRTC.setLogLevel(2); // 2: WARNING, 3: ERROR, 4: NONE
  } catch {
    // Ignore log setup issues
  }
}

export { AgoraRTC };
export type {
  IAgoraRTCClient,
  ILocalAudioTrack,
  ILocalVideoTrack,
  IRemoteAudioTrack,
  IRemoteVideoTrack,
  IAgoraRTCRemoteUser,
  UID,
};

/**
 * Helper to initialize a new Agora RTC Client
 */
export function createAgoraClient(): IAgoraRTCClient {
  return AgoraRTC.createClient({
    mode: AGORA_CONFIG.mode,
    codec: AGORA_CONFIG.codec,
  });
}

/**
 * Helper to safely generate audio and video tracks
 */
export async function createLocalAudioVideoTracks(): Promise<{
  audioTrack: ILocalAudioTrack | null;
  videoTrack: ILocalVideoTrack | null;
}> {
  let audioTrack: ILocalAudioTrack | null = null;
  let videoTrack: ILocalVideoTrack | null = null;

  try {
    const [microphoneTrack, cameraTrack] =
      await AgoraRTC.createMicrophoneAndCameraTracks(
        {
          encoderConfig: 'high_quality_stereo',
          AEC: true,
          ANS: true,
          AGC: true,
        },
        {
          encoderConfig: '720p_2',
        }
      );
    audioTrack = microphoneTrack;
    videoTrack = cameraTrack;
  } catch (err) {
    console.warn('Failed to create both audio/video tracks together, attempting fallback:', err);
    // Fallback: try creating microphone only
    try {
      audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
        encoderConfig: 'high_quality_stereo',
        AEC: true,
        ANS: true,
      });
    } catch (aErr) {
      console.warn('Microphone track creation skipped or denied:', aErr);
    }
    // Fallback: try creating camera only
    try {
      videoTrack = await AgoraRTC.createCameraVideoTrack({
        encoderConfig: '720p_2',
      });
    } catch (vErr) {
      console.warn('Camera track creation skipped or denied:', vErr);
    }
  }

  return { audioTrack, videoTrack };
}
