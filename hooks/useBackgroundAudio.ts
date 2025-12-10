import { useEffect, useRef } from 'react';

const SILENCE_URL = '/silence.mp3';

export interface UseBackgroundAudioOptions {
  enabled: boolean;
}

export const useBackgroundAudio = ({ enabled }: UseBackgroundAudioOptions) => {
  const silentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (silentAudioRef.current) {
        silentAudioRef.current.pause();
        silentAudioRef.current = null;
      }
      return;
    }

    const silentAudio = new Audio(SILENCE_URL);
    silentAudio.loop = true;
    silentAudio.volume = 0.01;
    silentAudioRef.current = silentAudio;

    const startSilentAudio = () => {
      silentAudio.play().catch(() => {});
    };

    document.addEventListener('touchstart', startSilentAudio, { once: true });
    document.addEventListener('click', startSilentAudio, { once: true });

    startSilentAudio();

    return () => {
      document.removeEventListener('touchstart', startSilentAudio);
      document.removeEventListener('click', startSilentAudio);
      silentAudio.pause();
      silentAudioRef.current = null;
    };
  }, [enabled]);

  return silentAudioRef;
};
