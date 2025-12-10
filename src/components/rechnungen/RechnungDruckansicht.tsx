import { Rechnung, RechnungPosition } from "@/hooks/useRechnungen";
import { Rechnungseinstellungen } from "@/hooks/useRechnungseinstellungen";
import { generateEpcData } from "@/hooks/useEpcQrCode";
import { formatPreis } from "@/lib/formatPreis";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { QRCodeSVG } from "qrcode.react";

interface RechnungDruckansichtProps {
  rechnung: Rechnung;
  positionen: RechnungPosition[];
  einstellungen: Rechnungseinstellungen | null;
}

export function RechnungDruckansicht({
  rechnung,
  positionen,
  einstellungen,
}: RechnungDruckansichtProps) {
  // EPC-QR-Code Data generieren
  const epcData = einstellungen?.bank_iban
    ? generateEpcData({
        bic: einstellungen.bank_bic || "",
        empfaenger: einstellungen.firma_bezeichnung || einstellungen.firma_name || "",
        iban: einstellungen.bank_iban,
        betrag: Number(rechnung.bruttobetrag),
        verwendungszweck: `Rechnung ${rechnung.rechnungsnummer}`,
      })
    : null;

  const formatDate = (date: string) => format(new Date(date), "dd.MM.yyyy", { locale: de });

  // Zahlungskondition Text mit Platzhaltern ersetzen
  const zahlungskonditionText = (einstellungen?.zahlungskondition_text || "Zahlungsfrist: {zahlungsfrist_tage} Tage netto")
    .replace(/{zahlungsfrist_tage}/g, String(einstellungen?.zahlungsfrist_tage || 14));

  return (
    <div className="bg-white text-black p-8 max-w-[210mm] mx-auto print:p-0 print:max-w-none font-sans text-sm">
      {/* Header: Kunde links, Firma rechts */}
      <div className="flex justify-between mb-8">
        {/* Linke Seite: Kundendaten */}
        <div className="space-y-1 max-w-[45%]">
          {rechnung.kunde_kundennummer && (
            <div className="text-xs mb-4">
              <p className="font-bold">Kunden-Nr. {rechnung.kunde_kundennummer}</p>
              <p className="text-gray-500 italic text-[10px]">
                (Bei Zahlung/Rücksendung/Gutschrift bitte unbedingt angeben!)
              </p>
            </div>
          )}
          
          <div className="border-b border-gray-300 pb-1 mb-2">
            {rechnung.kunde_firma && <p className="font-medium">{rechnung.kunde_firma}</p>}
            <p>{rechnung.kunde_name}</p>
            {rechnung.kunde_strasse && <p>{rechnung.kunde_strasse}</p>}
            {(rechnung.kunde_plz || rechnung.kunde_ort) && (
              <p>{rechnung.kunde_plz} {rechnung.kunde_ort}</p>
            )}
          </div>
        </div>

        {/* Rechte Seite: Firmendaten */}
        <div className="text-right space-y-1 max-w-[45%]">
          {einstellungen?.firma_name && (
            <p>{einstellungen.firma_name}</p>
          )}
          {einstellungen?.firma_bezeichnung && (
            <p className="font-bold">{einstellungen.firma_bezeichnung}</p>
          )}
          {einstellungen?.firma_strasse && <p>{einstellungen.firma_strasse}</p>}
          {(einstellungen?.firma_plz || einstellungen?.firma_ort) && (
            <p>{einstellungen.firma_plz} {einstellungen.firma_ort}</p>
          )}
          {einstellungen?.firma_telefon && <p>Tel {einstellungen.firma_telefon}</p>}
          {einstellungen?.firma_email && <p>{einstellungen.firma_email}</p>}
          
          {/* Registerdaten */}
          <div className="mt-4 pt-2 border-t border-gray-200 text-xs text-gray-600">
            {einstellungen?.firma_hg && <p>HG: {einstellungen.firma_hg}</p>}
            {einstellungen?.firma_fn && <p>FN: {einstellungen.firma_fn}</p>}
            {einstellungen?.firma_uid && <p>UID: {einstellungen.firma_uid}</p>}
          </div>
        </div>
      </div>

      {/* Rechnungstitel */}
      <div className="border-y border-gray-400 py-3 mb-6">
        <h1 className="text-xl font-bold">
          Rechnung Nr. {rechnung.rechnungsnummer} vom {formatDate(rechnung.rechnungsdatum)}
        </h1>
      </div>

      {/* Bestellreferenz */}
      <div className="mb-6 text-sm">
        <p>Bestellung: {rechnung.bestellnummer}</p>
      </div>

      {/* Positionstabelle */}
      <table className="w-full border-collapse mb-6">
        <thead>
          <tr className="border-b-2 border-gray-400">
            <th className="text-left py-2 w-12">Pos</th>
            <th className="text-left py-2 w-20">Art.Nr</th>
            <th className="text-left py-2">Bezeichnung</th>
            <th className="text-right py-2 w-16">Menge</th>
            <th className="text-right py-2 w-20">Preis</th>
            <th className="text-right py-2 w-24">Gesamt</th>
            <th className="text-right py-2 w-24">Summe Ust.</th>
          </tr>
        </thead>
        <tbody>
          {positionen.map((pos, index) => {
            const gesamtNetto = Number(pos.gesamtpreis);
            const ustAnteil = gesamtNetto * (Number(rechnung.mwst_satz) / 100);
            return (
              <tr key={pos.id} className="border-b border-gray-200">
                <td className="py-2">{index + 1}</td>
                <td className="py-2 font-mono text-xs">{pos.artikelnummer}</td>
                <td className="py-2">{pos.bezeichnung}</td>
                <td className="py-2 text-right">{pos.menge}</td>
                <td className="py-2 text-right">{formatPreis(pos.einzelpreis)}</td>
                <td className="py-2 text-right">{formatPreis(pos.gesamtpreis)}</td>
                <td className="py-2 text-right text-xs">
                  {formatPreis(gesamtNetto)} {rechnung.mwst_satz}%
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-400">
            <td colSpan={5} className="py-2 text-right font-medium">Gesamtbetrag Netto:</td>
            <td className="py-2 text-right font-medium">{formatPreis(rechnung.nettobetrag)}</td>
            <td></td>
          </tr>
          <tr>
            <td colSpan={5} className="py-1 text-right">MwSt ({rechnung.mwst_satz}%):</td>
            <td className="py-1 text-right">{formatPreis(rechnung.mwst_betrag)}</td>
            <td></td>
          </tr>
          {Number(rechnung.bearbeitungsgebuehr) > 0 && (
            <tr>
              <td colSpan={5} className="py-1 text-right">Bearbeitungsgebühr:</td>
              <td className="py-1 text-right">{formatPreis(rechnung.bearbeitungsgebuehr)}</td>
              <td></td>
            </tr>
          )}
          <tr className="border-t border-gray-300">
            <td colSpan={5} className="py-2 text-right font-bold text-lg">Gesamtbetrag:</td>
            <td className="py-2 text-right font-bold text-lg">{formatPreis(rechnung.bruttobetrag)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>

      {/* Zahlungskondition */}
      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded">
        <p className="font-medium">Rechnungskondition: {zahlungskonditionText}</p>
        {rechnung.faelligkeitsdatum && (
          <p className="mt-1">
            Wir ersuchen um Zahlung bis spätestens {formatDate(rechnung.faelligkeitsdatum)} per Überweisung.
          </p>
        )}
      </div>

      {/* Lieferadresse falls vorhanden */}
      {(rechnung.lieferadresse_strasse || rechnung.lieferadresse_ort) && (
        <div className="mb-6 text-sm">
          <p>Die Lieferung ging per Abhol / Zustellung an:</p>
          <p className="font-medium">
            {rechnung.lieferadresse_strasse && `${rechnung.lieferadresse_strasse}, `}
            {rechnung.lieferadresse_plz || ""} {rechnung.lieferadresse_ort || ""}
            {rechnung.lieferadresse_ort && ", Österreich"}
          </p>
        </div>
      )}

      {/* Footer: QR-Code und Bankverbindung */}
      <div className="mt-8 pt-6 border-t border-gray-300 flex items-start justify-between">
        {/* QR-Code */}
        <div className="flex items-start gap-4">
          {epcData ? (
            <div className="border border-gray-300 p-1 bg-white">
              <QRCodeSVG value={epcData} size={128} level="M" />
            </div>
          ) : (
            <div className="w-32 h-32 border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 text-xs text-center p-2">
              QR-Code nicht verfügbar
            </div>
          )}
          
          {/* Bankverbindung */}
          <div className="text-sm">
            <p className="font-medium mb-2">Bankverbindung:</p>
            {einstellungen?.bank_name && <p>{einstellungen.bank_name}</p>}
            {einstellungen?.bank_iban && <p>IBAN: {einstellungen.bank_iban}</p>}
            {einstellungen?.bank_bic && <p>BIC: {einstellungen.bank_bic}</p>}
          </div>
        </div>

        {/* Seitenzahl */}
        <div className="text-right text-sm text-gray-500">
          Seite 1
        </div>
      </div>
    </div>
  );
}