import { useEffect, useId, useRef, useState } from 'react';
import { Camera, CameraOff, ScanLine } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

export function QrScanner({ onDecoded }) {
  const generatedId = useId();
  const readerId = `qr-reader-${generatedId.replace(/:/g, '')}`;
  const callbackRef = useRef(onDecoded);
  const handlingScanRef = useRef(false);
  const [cameraState, setCameraState] = useState('starting');
  const [cameraMessage, setCameraMessage] = useState('Requesting camera access…');

  useEffect(() => {
    callbackRef.current = onDecoded;
  }, [onDecoded]);

  useEffect(() => {
    let cancelled = false;
    const scanner = new Html5Qrcode(readerId);

    const clearScanner = () => {
      try {
        scanner.clear();
      } catch {
        // The reader may already have been cleared by the browser.
      }
    };

    const releaseCamera = () => {
      if (!scanner.isScanning) return;
      scanner.stop().catch(() => {}).finally(clearScanner);
    };

    async function start() {
      try {
        if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
          throw Object.assign(new Error('Camera requires a secure browser context.'), {
            name: 'CameraUnavailableError',
          });
        }

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 240, height: 240 },
            aspectRatio: 1,
          },
          (decodedText) => {
            if (handlingScanRef.current) return;
            handlingScanRef.current = true;
            Promise.resolve(callbackRef.current(decodedText))
              .catch(() => {})
              .finally(() => {
                window.setTimeout(() => {
                  handlingScanRef.current = false;
                }, 1200);
              });
          },
          () => {},
        );

        if (cancelled) {
          releaseCamera();
          return;
        }

        setCameraState('ready');
        setCameraMessage('Camera ready — point it at an EventFlow ticket.');
      } catch (error) {
        if (!cancelled) {
          setCameraState('unavailable');
          setCameraMessage(
            error?.name === 'NotAllowedError'
              ? 'Camera permission was denied. Use manual verification below.'
              : 'Camera scanning is unavailable here. Use manual verification below.',
          );
        }
      }
    }

    const startPromise = start();

    return () => {
      cancelled = true;
      if (scanner.isScanning) {
        releaseCamera();
      } else {
        startPromise.finally(() => {
          if (scanner.isScanning) releaseCamera();
          else clearScanner();
        });
      }
    };
  }, [readerId]);

  return (
    <section className="scanner-card">
      <div className="scanner-header">
        <div>
          <span className="eyebrow">LIVE SCANNER</span>
          <h2>Scan a ticket</h2>
        </div>
        <span className={`scanner-indicator scanner-${cameraState}`}>
          <span />
          {cameraState === 'ready' ? 'Ready' : cameraState === 'starting' ? 'Starting' : 'Manual mode'}
        </span>
      </div>
      <div className={`scanner-viewport scanner-${cameraState}`}>
        <div id={readerId} className="qr-reader" />
        {cameraState !== 'ready' && (
          <div className="scanner-placeholder">
            {cameraState === 'starting'
              ? <ScanLine size={32} className="scan-line-icon" />
              : <CameraOff size={32} />}
            <p>{cameraMessage}</p>
            {cameraState === 'unavailable' && (
              <span className="scanner-helper">
                <Camera size={14} /> Camera access is optional — manual entry always works.
              </span>
            )}
          </div>
        )}
        <span className="scan-corner scan-corner-tl" />
        <span className="scan-corner scan-corner-tr" />
        <span className="scan-corner scan-corner-bl" />
        <span className="scan-corner scan-corner-br" />
      </div>
      <p className="scanner-footnote">
        <ScanLine size={14} /> The backend verifies every scan against live ticket data.
      </p>
    </section>
  );
}
