interface EpcQrCodeParams {
  bic: string;
  empfaenger: string;
  iban: string;
  betrag: number;
  verwendungszweck: string;
}

/**
 * Generiert EPC-QR-Code Daten (European Payments Council) für SEPA-Überweisungen
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

export type { EpcQrCodeParams };
