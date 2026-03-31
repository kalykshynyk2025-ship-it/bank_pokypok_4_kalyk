'use client';

import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/context/i18n-context';

interface QrScannerProps {
  onDetected: (text: string) => void;
}

export default function QrScanner({ onDetected }: QrScannerProps) {
  const { t } = useI18n();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [active, setActive] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [supportsDetector, setSupportsDetector] = useState(false);

  useEffect(() => {
    setSupportsDetector(typeof window !== 'undefined' && 'BarcodeDetector' in window);
  }, []);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let timer: number | null = null;

    async function startNativeScanner() {
      if (!active || !supportsDetector || !videoRef.current) {
        return;
      }

      const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });

      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      timer = window.setInterval(async () => {
        if (!videoRef.current) {
          return;
        }

        try {
          const codes = await detector.detect(videoRef.current);
          if (codes?.length) {
            const value = codes[0].rawValue;
            if (value) {
              onDetected(value);
              setActive(false);
            }
          }
        } catch {
          // ignore frame errors
        }
      }, 500);
    }

    startNativeScanner();

    return () => {
      if (timer) {
        clearInterval(timer);
      }

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [active, onDetected, supportsDetector]);

  function submitManualCode() {
    if (!manualCode.trim()) {
      return;
    }

    onDetected(manualCode.trim());
    setManualCode('');
  }

  return (
    <div className="soft-card soft-yellow">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setActive((prev) => !prev)} className="btn-primary">
          {active ? t('quest.stopScan') : t('quest.scanButton')}
        </button>

        <input
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          placeholder="lvl1 / lvl2 / ..."
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
        />
        <button type="button" onClick={submitManualCode} className="btn-secondary">
          OK
        </button>
      </div>

      {active && supportsDetector && <video ref={videoRef} className="mt-3 w-full rounded-xl" muted playsInline />}

      {active && !supportsDetector && (
        <p className="mt-3 text-sm text-slate-600">BarcodeDetector не поддерживается, используйте ручной ввод QR-кода.</p>
      )}
    </div>
  );
}
