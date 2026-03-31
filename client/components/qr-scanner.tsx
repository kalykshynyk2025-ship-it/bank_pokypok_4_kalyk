'use client';

import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/context/i18n-context';

interface QrScannerProps {
  onDetected: (text: string) => void;
}

export default function QrScanner({ onDetected }: QrScannerProps) {
  const { t } = useI18n();
  const [active, setActive] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let html5Qrcode: { start: Function; stop: Function } | null = null;
    let mounted = true;

    async function initScanner() {
      if (!active || !containerRef.current) {
        return;
      }

      const { Html5Qrcode } = await import('html5-qrcode');

      html5Qrcode = new Html5Qrcode('qr-reader');

      await html5Qrcode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        (decodedText: string) => {
          if (!mounted) {
            return;
          }

          onDetected(decodedText);
          setActive(false);
        },
        () => {}
      );
    }

    initScanner();

    return () => {
      mounted = false;
      if (html5Qrcode) {
        html5Qrcode.stop().catch(() => null);
      }
    };
  }, [active, onDetected]);

  return (
    <div className="soft-card soft-yellow">
      <button
        type="button"
        onClick={() => setActive((prev) => !prev)}
        className="btn-primary"
      >
        {active ? t('quest.stopScan') : t('quest.scanButton')}
      </button>

      {active && <div id="qr-reader" ref={containerRef} className="mt-3" />}
    </div>
  );
}
