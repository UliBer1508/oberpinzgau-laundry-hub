import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface EpcQrCodeParams {
  bic: string;
  empfaenger: string;
  iban: string;
  betrag: number;
  verwendungszweck: string;
}

/**
 * Generiert einen EPC-QR-Code (European Payments Council) für SEPA-Überweisungen
 */
export function generateEpcData(params: EpcQrCodeParams): string {
  const { bic, empfaenger, iban, betrag, verwendungszweck } = params;
  
  // Formatiere Betrag mit 2 Dezimalstellen
  const formattedBetrag = `EUR${betrag.toFixed(2)}`;
  
  // EPC-QR-Code Format nach ISO 20022
  const epcLines = [
    'BCD',                              // Service Tag (immer BCD)
    '002',                              // Version (002 = UTF-8)
    '1',                                // Zeichencodierung (1 = UTF-8)
    'SCT',                              // SEPA Credit Transfer
    bic || '',                          // BIC des Empfängers
    empfaenger.substring(0, 70) || '',  // Name des Empfängers (max 70 Zeichen)
    iban.replace(/\s/g, '') || '',      // IBAN des Empfängers
    formattedBetrag,                    // Betrag
    '',                                 // Zweck (leer)
    '',                                 // Referenz (leer)
    verwendungszweck.substring(0, 140) || '', // Verwendungszweck (max 140 Zeichen)
    ''                                  // Hinweis (leer)
  ];
  
  return epcLines.join('\n');
}

export function useEpcQrCode(params: EpcQrCodeParams | null): string | null {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!params || !params.iban || !params.empfaenger || params.betrag <= 0) {
      setQrCodeDataUrl(null);
      return;
    }

    const epcData = generateEpcData(params);

    QRCode.toDataURL(epcData, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 150,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => {
        console.error('QR-Code Generierung fehlgeschlagen:', err);
        setQrCodeDataUrl(null);
      });
  }, [params?.bic, params?.empfaenger, params?.iban, params?.betrag, params?.verwendungszweck]);

  return qrCodeDataUrl;
}
