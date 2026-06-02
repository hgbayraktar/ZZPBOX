import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  gebruikBedrijf,
  gebruikFacturen,
  gebruikKlanten,
  gebruikOffertes,
  gebruikPakket,
  gebruikProducten,
  gebruikTransacties,
} from '../../hooks/gebruikData';

const BTW_OPTIES = ['21%', '9%', '0%', 'Verlegd', 'Vrijgesteld'];

type OfferteRegel = {
  id: string;
  omschrijving: string;
  aantal: string;
  prijs: string;
  btw: string;
  eenheid: string;
};

function offerteHtml(offerte: any, bedrijf: any): string {
  const euro = (b: number) => `€ ${b.toFixed(2).replace('.', ',')}`;

  function berekenRegel(r: OfferteRegel): number {
    return parseFloat(r.aantal || '0') * parseFloat(r.prijs?.replace(',', '.') || '0');
  }

  function berekenBtw(r: OfferteRegel): number {
    const sub = berekenRegel(r);
    if (r.btw === '21%') return sub * 0.21;
    if (r.btw === '9%') return sub * 0.09;
    return 0;
  }

  const subtotaal = offerte.regels?.reduce((s: number, r: OfferteRegel) => s + berekenRegel(r), 0) || 0;
  const totaalBtw = offerte.regels?.reduce((s: number, r: OfferteRegel) => s + berekenBtw(r), 0) || 0;
  const totaal = subtotaal + totaalBtw;

  const regelsHtml = offerte.regels?.map((r: OfferteRegel) => `
    <tr>
      <td style="padding: 10px 8px; border-bottom: 1px solid #f0f0f0;">
        <div style="font-weight: 600; color: #1a1a1a;">${r.omschrijving}</div>
        <div style="font-size: 11px; color: #888; margin-top: 2px;">BTW ${r.btw} — per ${r.eenheid}</div>
      </td>
      <td style="padding: 10px 8px; border-bottom: 1px solid #f0f0f0; text-align: center; color: #555;">${r.aantal}</td>
      <td style="padding: 10px 8px; border-bottom: 1px solid #f0f0f0; text-align: right; color: #555;">${euro(parseFloat(r.prijs?.replace(',', '.') || '0'))}</td>
      <td style="padding: 10px 8px; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: 600; color: #1a1a1a;">${euro(berekenRegel(r))}</td>
    </tr>
  `).join('') || '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; background: #fff; color: #1a1a1a; font-size: 13px; }
        .pagina { max-width: 794px; margin: 0 auto; padding: 48px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
        .bedrijf-naam { font-size: 22px; font-weight: 800; color: #1a1a1a; margin-bottom: 6px; }
        .bedrijf-info { color: #888; font-size: 12px; line-height: 1.8; }
        .offerte-blok { text-align: right; }
        .offerte-label { font-size: 10px; font-weight: 800; letter-spacing: 2px; color: #C9A84C; margin-bottom: 4px; }
        .offerte-nummer { font-size: 24px; font-weight: 900; color: #1a1a1a; }
        .scheidingslijn-goud { border: none; border-top: 2px solid #C9A84C; margin: 24px 0; }
        .datum-rij { display: flex; gap: 40px; margin-bottom: 24px; }
        .datum-item label { font-size: 10px; font-weight: 700; letter-spacing: 1px; color: #888; display: block; margin-bottom: 4px; }
        .datum-item span { font-size: 13px; font-weight: 600; color: #1a1a1a; }
        .klant-sectie { background: #f8f8f8; border-radius: 10px; padding: 18px; margin-bottom: 32px; }
        .klant-label { font-size: 10px; font-weight: 800; letter-spacing: 1.5px; color: #888; margin-bottom: 8px; }
        .klant-naam { font-size: 15px; font-weight: 800; color: #1a1a1a; margin-bottom: 4px; }
        .klant-info { color: #666; font-size: 12px; line-height: 1.7; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        thead { background: #1a1a1a; }
        thead th { padding: 12px 8px; text-align: left; color: #fff; font-size: 11px; font-weight: 700; }
        thead th:not(:first-child) { text-align: center; }
        thead th:last-child { text-align: right; }
        .totaal-blok { margin-left: auto; width: 280px; }
        .totaal-rij { display: flex; justify-content: space-between; padding: 7px 0; color: #555; font-size: 13px; }
        .totaal-rij.hoofd { background: #1a1a1a; color: #fff; padding: 14px 16px; border-radius: 10px; margin-top: 8px; font-size: 15px; font-weight: 800; }
        .totaal-rij.hoofd span:last-child { color: #C9A84C; font-size: 18px; }
        .geldigheid { background: #fff8e8; border: 1px solid #C9A84C; border-radius: 10px; padding: 18px; margin-top: 16px; }
        .geldigheid-titel { font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: #C9A84C; margin-bottom: 8px; }
        .geldigheid-info { color: #555; font-size: 13px; line-height: 1.7; }
        .notities { background: #f8f8f8; border-radius: 10px; padding: 18px; margin-top: 24px; }
        .notities-label { font-size: 10px; font-weight: 800; letter-spacing: 1.5px; color: #888; margin-bottom: 8px; }
        .notities-tekst { color: #555; font-size: 13px; line-height: 1.6; }
        .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #f0f0f0; display: flex; justify-content: space-between; }
        .footer-links { color: #aaa; font-size: 11px; line-height: 1.8; }
        .footer-rechts { color: #C9A84C; font-size: 11px; font-weight: 700; }
        .status-badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; }
      </style>
    </head>
    <body>
      <div class="pagina">
        <div class="header">
          <div>
            <div class="bedrijf-naam">${bedrijf.bedrijfsnaam || 'Bedrijfsnaam'}</div>
            <div class="bedrijf-info">
              ${bedrijf.naamEigenaar ? bedrijf.naamEigenaar + '<br>' : ''}
              ${bedrijf.straat ? bedrijf.straat + ' ' + (bedrijf.huisnummer || '') + '<br>' : ''}
              ${bedrijf.postcode ? bedrijf.postcode + ' ' + (bedrijf.plaats || '') + '<br>' : ''}
              ${bedrijf.kvkNummer ? 'KvK: ' + bedrijf.kvkNummer + '<br>' : ''}
              ${bedrijf.btwNummer ? 'BTW: ' + bedrijf.btwNummer + '<br>' : ''}
              ${bedrijf.email ? bedrijf.email + '<br>' : ''}
              ${bedrijf.telefoon ? bedrijf.telefoon + '<br>' : ''}
              ${bedrijf.website ? bedrijf.website : ''}
            </div>
          </div>
          <div class="offerte-blok">
            <div class="offerte-label">OFFERTE</div>
            <div class="offerte-nummer">${offerte.offerteNummer}</div>
            <div style="margin-top: 8px; font-size: 11px; color: #888; font-weight: 600;">
              ${offerte.status === 'geaccepteerd' ? '✓ Geaccepteerd' : offerte.status === 'verzonden' ? '📤 Verzonden' : offerte.status === 'verlopen' ? '⏰ Verlopen' : '📝 Concept'}
            </div>
          </div>
        </div>
        <hr class="scheidingslijn-goud">
        <div class="datum-rij">
          <div class="datum-item"><label>DATUM</label><span>${offerte.datum}</span></div>
          <div class="datum-item"><label>GELDIG TOT</label><span>${offerte.geldigTot}</span></div>
          <div class="datum-item"><label>NUMMER</label><span>${offerte.offerteNummer}</span></div>
        </div>
        <div class="klant-sectie">
          <div class="klant-label">OFFERTE VOOR</div>
          <div class="klant-naam">${offerte.klantNaam}</div>
          <div class="klant-info">
            ${offerte.klantAdres ? offerte.klantAdres + '<br>' : ''}
            ${offerte.klantEmail ? offerte.klantEmail + '<br>' : ''}
            ${offerte.klantKvk ? 'KvK: ' + offerte.klantKvk + '<br>' : ''}
            ${offerte.klantBtw ? 'BTW: ' + offerte.klantBtw : ''}
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 45%;">Omschrijving</th>
              <th style="width: 10%; text-align: center;">Aantal</th>
              <th style="width: 20%; text-align: right;">Prijs excl. BTW</th>
              <th style="width: 25%; text-align: right;">Totaal excl. BTW</th>
            </tr>
          </thead>
          <tbody>${regelsHtml}</tbody>
        </table>
        <div class="totaal-blok">
          <div class="totaal-rij"><span>Subtotaal excl. BTW</span><span>${euro(subtotaal)}</span></div>
          <div class="totaal-rij"><span>BTW</span><span>${euro(totaalBtw)}</span></div>
          <div class="totaal-rij hoofd"><span>TOTAAL INCL. BTW</span><span>${euro(totaal)}</span></div>
        </div>
        <div class="geldigheid">
          <div class="geldigheid-titel">GELDIGHEID</div>
          <div class="geldigheid-info">
            Deze offerte is geldig tot <strong>${offerte.geldigTot}</strong>.<br>
            Bij akkoord kunt u contact opnemen via ${bedrijf.email || 'ons e-mailadres'}.
          </div>
        </div>
        ${offerte.notities ? `
        <div class="notities">
          <div class="notities-label">NOTITIES</div>
          <div class="notities-tekst">${offerte.notities}</div>
        </div>` : ''}
        <div class="footer">
          <div class="footer-links">${bedrijf.bedrijfsnaam || ''}<br>${bedrijf.email || ''}<br>${bedrijf.website || ''}</div>
          <div class="footer-rechts">Gemaakt met ZZPBox</div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export default function OffertesScherm() {
  const router = useRouter();
  const pakket = gebruikPakket();
  const { offertes, laden, toevoegen, bijwerken, verwijderen } = gebruikOffertes();
  const { facturen, toevoegen: factuurToevoegen } = gebruikFacturen();
  const { klanten } = gebruikKlanten();
  const { producten } = gebruikProducten();
  const { bedrijf } = gebruikBedrijf();
  const { toevoegen: transactieToevoegen } = gebruikTransacties();

  const [modalZichtbaar, setModalZichtbaar] = useState(false);
  const [voorbeeldZichtbaar, setVoorbeeldZichtbaar] = useState(false);
  const [geselecteerdeOfferte, setGeselecteerdeOfferte] = useState<any>(null);
  const [klantModalZichtbaar, setKlantModalZichtbaar] = useState(false);
  const [productModalZichtbaar, setProductModalZichtbaar] = useState(false);
  const [actieveRegelId, setActieveRegelId] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);
  const [pdfBezig, setPdfBezig] = useState(false);
  const [nummerModalZichtbaar, setNummerModalZichtbaar] = useState(false);
  const [startNummerInvoer, setStartNummerInvoer] = useState('1');

  const [offerteNummer, setOfferteNummer] = useState('');
  const [klantNaam, setKlantNaam] = useState('');
  const [klantEmail, setKlantEmail] = useState('');
  const [klantAdres, setKlantAdres] = useState('');
  const [klantKvk, setKlantKvk] = useState('');
  const [klantBtw, setKlantBtw] = useState('');
  const [datum, setDatum] = useState(new Date().toLocaleDateString('nl-NL'));
  const [geldigTot, setGeldigTot] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toLocaleDateString('nl-NL');
  });
  const [regels, setRegels] = useState<OfferteRegel[]>([
    { id: '1', omschrijving: '', aantal: '1', prijs: '', btw: '21%', eenheid: 'stuk' }
  ]);
  const [notities, setNotities] = useState('');

  function volgendOfferteNummer(): string {
    if (offertes.length === 0) return 'OFR0001';
    const nummers = offertes
      .map(o => parseInt((o.offerteNummer || '').replace('OFR', '')) || 0)
      .filter(n => n > 0);
    const max = nummers.length > 0 ? Math.max(...nummers) : 0;
    return `OFR${String(max + 1).padStart(4, '0')}`;
  }

  function volgendFactuurNummer(): string {
    const jaar = new Date().getFullYear();
    const volgnummer = String(facturen.length + 1).padStart(3, '0');
    return `${jaar}-${volgnummer}`;
  }

  function nieuweOfferte() {
    if (pakket === 'gratis') {
      Alert.alert('Premium functie', 'Offertes aanmaken is alleen beschikbaar in Premium.', [
        { text: 'Annuleren', style: 'cancel' },
        { text: 'Upgraden', onPress: () => router.push('/(tabs)/abonnement') }
      ]);
      return;
    }
    setOfferteNummer(volgendOfferteNummer());
    setKlantNaam(''); setKlantEmail(''); setKlantAdres('');
    setKlantKvk(''); setKlantBtw(''); setNotities('');
    setDatum(new Date().toLocaleDateString('nl-NL'));
    const d = new Date(); d.setDate(d.getDate() + 30);
    setGeldigTot(d.toLocaleDateString('nl-NL'));
    setRegels([{ id: '1', omschrijving: '', aantal: '1', prijs: '', btw: '21%', eenheid: 'stuk' }]);
    setModalZichtbaar(true);
  }

  function startNummerInstellen() {
    const num = parseInt(startNummerInvoer);
    if (isNaN(num) || num < 1) {
      Alert.alert('Ongeldig nummer', 'Voer een geldig startnummer in (minimaal 1).');
      return;
    }
    setNummerModalZichtbaar(false);
    Alert.alert('Ingesteld', `Volgende offerte begint bij OFR${String(num).padStart(4, '0')}.`);
  }

  function klantSelecteren(klant: any) {
    setKlantNaam(klant.bedrijfsnaam);
    setKlantEmail(klant.email);
    setKlantAdres(`${klant.straat || ''} ${klant.huisnummer || ''}, ${klant.postcode || ''} ${klant.plaats || ''}`.trim());
    setKlantKvk(klant.kvkNummer || '');
    setKlantBtw(klant.btwNummer || '');
    setKlantModalZichtbaar(false);
    setTimeout(() => setModalZichtbaar(true), 300);
  }

  function productSelecteren(product: any) {
    if (!actieveRegelId) return;
    setRegels(regels.map(r =>
      r.id === actieveRegelId
        ? { ...r, omschrijving: product.naam, prijs: product.prijs, btw: product.btw, eenheid: product.eenheid }
        : r
    ));
    setProductModalZichtbaar(false);
    setTimeout(() => setModalZichtbaar(true), 300);
    setActieveRegelId(null);
  }

  function regelToevoegen() {
    setRegels([...regels, { id: Date.now().toString(), omschrijving: '', aantal: '1', prijs: '', btw: '21%', eenheid: 'stuk' }]);
  }

  function regelBijwerken(id: string, veld: keyof OfferteRegel, waarde: string) {
    setRegels(regels.map(r => r.id === id ? { ...r, [veld]: waarde } : r));
  }

  function regelVerwijderen(id: string) {
    if (regels.length === 1) return;
    setRegels(regels.filter(r => r.id !== id));
  }

  function berekenRegelTotaal(regel: OfferteRegel): number {
    return parseFloat(regel.aantal || '0') * parseFloat(regel.prijs?.replace(',', '.') || '0');
  }

  function berekenBtw(regel: OfferteRegel): number {
    const sub = berekenRegelTotaal(regel);
    if (regel.btw === '21%') return sub * 0.21;
    if (regel.btw === '9%') return sub * 0.09;
    return 0;
  }

  const subtotaal = regels.reduce((s, r) => s + berekenRegelTotaal(r), 0);
  const totaalBtw = regels.reduce((s, r) => s + berekenBtw(r), 0);
  const totaal = subtotaal + totaalBtw;

  function euro(b: number) { return `€ ${b.toFixed(2).replace('.', ',')}`; }

  async function offerteOpslaan() {
    if (!klantNaam || regels.some(r => !r.omschrijving || !r.prijs)) {
      Alert.alert('Verplichte velden', 'Vul klantnaam en alle regelomschrijvingen en prijzen in.');
      return;
    }
    setBezig(true);
    try {
      await toevoegen({ offerteNummer, klantNaam, klantEmail, klantAdres, klantKvk, klantBtw, datum, geldigTot, regels, status: 'concept', notities });
      setModalZichtbaar(false);
      Alert.alert('Opgeslagen', `Offerte ${offerteNummer} is aangemaakt.`);
    } catch {
      Alert.alert('Fout', 'Kon offerte niet opslaan. Probeer opnieuw.');
    } finally {
      setBezig(false);
    }
  }

  async function omzettenNaarFactuur(offerte: any) {
    Alert.alert(
      'Omzetten naar factuur',
      `Weet u zeker dat u offerte ${offerte.offerteNummer} wilt omzetten naar een factuur?`,
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Omzetten', onPress: async () => {
            try {
              const nieuwFactuurNummer = volgendFactuurNummer();
              const vandaag = new Date().toLocaleDateString('nl-NL');
              const verval = new Date(); verval.setDate(verval.getDate() + 30);
              const vervaldatum = verval.toLocaleDateString('nl-NL');

              const regelsVoorFactuur = offerte.regels?.map((r: OfferteRegel) => ({ ...r, id: Date.now().toString() + r.id })) || [];

              await factuurToevoegen({
                factuurNummer: nieuwFactuurNummer,
                klantNaam: offerte.klantNaam,
                klantEmail: offerte.klantEmail,
                klantAdres: offerte.klantAdres,
                klantKvk: offerte.klantKvk,
                klantBtw: offerte.klantBtw,
                datum: vandaag,
                vervaldatum,
                regels: regelsVoorFactuur,
                status: 'concept',
                soort: 'factuur',
                notities: `Omgezet vanuit offerte ${offerte.offerteNummer}`,
                origineelFactuurNummer: null,
              });

              const regelsBtw21 = regelsVoorFactuur.filter((r: OfferteRegel) => r.btw === '21%');
              const regelsBtw9 = regelsVoorFactuur.filter((r: OfferteRegel) => r.btw === '9%');
              const btw21 = regelsBtw21.reduce((s: number, r: OfferteRegel) => s + parseFloat(r.aantal || '0') * parseFloat(r.prijs?.replace(',', '.') || '0') * 0.21, 0);
              const btw9 = regelsBtw9.reduce((s: number, r: OfferteRegel) => s + parseFloat(r.aantal || '0') * parseFloat(r.prijs?.replace(',', '.') || '0') * 0.09, 0);
              const totaalBtwBedrag = btw21 + btw9;
              const totaalBedrag = regelsVoorFactuur.reduce((s: number, r: OfferteRegel) => s + parseFloat(r.aantal || '0') * parseFloat(r.prijs?.replace(',', '.') || '0'), 0) + totaalBtwBedrag;

              await transactieToevoegen({
                omschrijving: `Factuur ${nieuwFactuurNummer} — ${offerte.klantNaam}`,
                bedrag: totaalBedrag.toFixed(2),
                soort: 'inkomst',
                categorie: 'Omzet diensten',
                datum: vandaag,
                btwTarief: btw21 > 0 ? '21%' : btw9 > 0 ? '9%' : '0%',
                btwBedrag: totaalBtwBedrag.toFixed(2),
                factuurNummer: nieuwFactuurNummer,
              });

              await bijwerken(offerte.id, { status: 'geaccepteerd' });
              setVoorbeeldZichtbaar(false);
              Alert.alert('✅ Gelukt!', `Factuur ${nieuwFactuurNummer} is aangemaakt. U vindt deze in het facturen overzicht.`);
            } catch {
              Alert.alert('Fout', 'Kon offerte niet omzetten. Probeer opnieuw.');
            }
          }
        }
      ]
    );
  }

  async function pdfDelen(offerte: any) {
    if (pakket === 'gratis') {
      Alert.alert('Premium functie', 'PDF delen is alleen beschikbaar in Premium.', [
        { text: 'Annuleren', style: 'cancel' },
        { text: 'Upgraden', onPress: () => router.push('/(tabs)/abonnement') }
      ]);
      return;
    }
    setPdfBezig(true);
    try {
      const html = offerteHtml(offerte, bedrijf);
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      const deelbaar = await Sharing.isAvailableAsync();
      if (deelbaar) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Offerte ${offerte.offerteNummer} delen`,
          UTI: 'com.adobe.pdf',
        });
        await bijwerken(offerte.id, { status: 'verzonden' });
      } else {
        Alert.alert('Niet beschikbaar', 'Delen is niet beschikbaar op dit apparaat.');
      }
    } catch {
      Alert.alert('Fout', 'Kon PDF niet aanmaken.');
    } finally {
      setPdfBezig(false);
    }
  }

  const statusKleur: Record<string, string> = {
    concept: '#888',
    verzonden: '#003DA5',
    geaccepteerd: '#4CAF50',
    verlopen: '#f44336',
  };

  const statusLabel: Record<string, string> = {
    concept: '📝 Concept',
    verzonden: '📤 Verzonden',
    geaccepteerd: '✓ Geaccepteerd',
    verlopen: '⏰ Verlopen',
  };

  return (
    <View style={stijlen.scherm}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />

      <View style={stijlen.koptekst}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={stijlen.terugTekst}>← Terug</Text>
        </TouchableOpacity>
        <Text style={stijlen.koptekstTitel}>Offertes</Text>
        <TouchableOpacity onPress={() => setNummerModalZichtbaar(true)}>
          <Text style={stijlen.instellingenKnop}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={stijlen.toevoegKnop} onPress={nieuweOfferte} activeOpacity={0.8}>
        <Text style={stijlen.toevoegKnopTekst}>+ Nieuwe offerte</Text>
      </TouchableOpacity>

      {laden ? (
        <ActivityIndicator color="#C9A84C" style={{ marginTop: 40 }} />
      ) : offertes.length === 0 ? (
        <View style={stijlen.leegScherm}>
          <Text style={stijlen.leegIcoon}>📋</Text>
          <Text style={stijlen.leegTitel}>Nog geen offertes</Text>
          <Text style={stijlen.leegTekst}>Maak uw eerste offerte aan en stuur deze naar uw klant.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {[...offertes].sort((a, b) => (b.aangemaaktOp || '').localeCompare(a.aangemaaktOp || '')).map(offerte => (
            <TouchableOpacity
              key={offerte.id}
              style={stijlen.offerteKaart}
              onPress={() => { setGeselecteerdeOfferte(offerte); setVoorbeeldZichtbaar(true); }}
              activeOpacity={0.8}>
              <View style={stijlen.offerteKaartRij}>
                <View style={{ flex: 1 }}>
                  <Text style={stijlen.offerteNummer}>{offerte.offerteNummer}</Text>
                  <Text style={stijlen.offerteKlant}>{offerte.klantNaam}</Text>
                  <Text style={stijlen.offerteDatum}>{offerte.datum} · geldig tot {offerte.geldigTot}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <View style={[stijlen.statusBadge, { backgroundColor: (statusKleur[offerte.status] || '#888') + '22' }]}>
                    <Text style={[stijlen.statusTekst, { color: statusKleur[offerte.status] || '#888' }]}>
                      {statusLabel[offerte.status] || offerte.status}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => pdfDelen(offerte)} disabled={pdfBezig}>
                    {pdfBezig ? <ActivityIndicator color="#C9A84C" size="small" /> : <Text style={stijlen.deelKnop}>📤 Delen</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Offerte aanmaken modal */}
      <Modal visible={modalZichtbaar} animationType="slide" onRequestClose={() => setModalZichtbaar(false)}>
        <View style={stijlen.modalScherm}>
          <View style={stijlen.modalKoptekst}>
            <TouchableOpacity onPress={() => setModalZichtbaar(false)}>
              <Text style={stijlen.annuleerTekst}>Annuleren</Text>
            </TouchableOpacity>
            <Text style={stijlen.modalTitel}>Nieuwe offerte</Text>
            <TouchableOpacity onPress={offerteOpslaan} disabled={bezig}>
              {bezig ? <ActivityIndicator color="#C9A84C" size="small" /> : <Text style={stijlen.opslaanTekst}>Opslaan</Text>}
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
            <Text style={stijlen.sectieLabel}>OFFERTENUMMER</Text>
            <TextInput style={stijlen.invoer} value={offerteNummer} onChangeText={setOfferteNummer} placeholderTextColor="#444" />

            <Text style={stijlen.sectieLabel}>KLANT</Text>
            <TouchableOpacity style={stijlen.klantKnop} onPress={() => { setModalZichtbaar(false); setTimeout(() => setKlantModalZichtbaar(true), 300); }}>
              <Text style={stijlen.klantKnopTekst}>{klantNaam || '+ Klant selecteren'}</Text>
            </TouchableOpacity>
            {klantNaam ? (
              <>
                <TextInput style={stijlen.invoer} placeholder="E-mail" placeholderTextColor="#444" value={klantEmail} onChangeText={setKlantEmail} keyboardType="email-address" />
                <TextInput style={stijlen.invoer} placeholder="Adres" placeholderTextColor="#444" value={klantAdres} onChangeText={setKlantAdres} />
              </>
            ) : null}

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={stijlen.sectieLabel}>DATUM</Text>
                <TextInput style={stijlen.invoer} value={datum} onChangeText={setDatum} placeholderTextColor="#444" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={stijlen.sectieLabel}>GELDIG TOT</Text>
                <TextInput style={stijlen.invoer} value={geldigTot} onChangeText={setGeldigTot} placeholderTextColor="#444" />
              </View>
            </View>

            <Text style={stijlen.sectieLabel}>REGELOMSCHRIJVING</Text>
            {regels.map((regel, index) => (
              <View key={regel.id} style={stijlen.regelKaart}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ color: '#888', fontSize: 12, fontWeight: '700' }}>Regel {index + 1}</Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity onPress={() => { setActieveRegelId(regel.id); setModalZichtbaar(false); setTimeout(() => setProductModalZichtbaar(true), 300); }}>
                      <Text style={{ color: '#C9A84C', fontSize: 12, fontWeight: '600' }}>+ Product</Text>
                    </TouchableOpacity>
                    {regels.length > 1 && (
                      <TouchableOpacity onPress={() => regelVerwijderen(regel.id)}>
                        <Text style={{ color: '#f44336', fontSize: 12, fontWeight: '600' }}>Verwijder</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                <TextInput style={stijlen.invoer} placeholder="Omschrijving" placeholderTextColor="#444" value={regel.omschrijving} onChangeText={v => regelBijwerken(regel.id, 'omschrijving', v)} />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TextInput style={[stijlen.invoer, { flex: 1 }]} placeholder="Aantal" placeholderTextColor="#444" value={regel.aantal} onChangeText={v => regelBijwerken(regel.id, 'aantal', v)} keyboardType="decimal-pad" />
                  <TextInput style={[stijlen.invoer, { flex: 2 }]} placeholder="Prijs excl. BTW" placeholderTextColor="#444" value={regel.prijs} onChangeText={v => regelBijwerken(regel.id, 'prijs', v)} keyboardType="decimal-pad" />
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#666', fontSize: 11, marginBottom: 4 }}>BTW</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        {BTW_OPTIES.map(opt => (
                          <TouchableOpacity key={opt} style={[stijlen.btwOptie, regel.btw === opt && stijlen.btwOptieActief]} onPress={() => regelBijwerken(regel.id, 'btw', opt)}>
                            <Text style={[stijlen.btwOptieTekst, regel.btw === opt && { color: '#1a1a1a' }]}>{opt}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#666', fontSize: 11, marginBottom: 4 }}>Eenheid</Text>
                    <TextInput style={stijlen.invoer} placeholder="stuk" placeholderTextColor="#444" value={regel.eenheid} onChangeText={v => regelBijwerken(regel.id, 'eenheid', v)} />
                  </View>
                </View>
                <Text style={{ color: '#C9A84C', fontSize: 13, fontWeight: '700', textAlign: 'right', marginTop: 4 }}>
                  {euro(berekenRegelTotaal(regel))} excl. BTW
                </Text>
              </View>
            ))}

            <TouchableOpacity style={stijlen.regelToevoegKnop} onPress={regelToevoegen}>
              <Text style={stijlen.regelToevoegTekst}>+ Regel toevoegen</Text>
            </TouchableOpacity>

            <View style={stijlen.totaalKaart}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ color: '#888', fontSize: 13 }}>Subtotaal excl. BTW</Text>
                <Text style={{ color: '#aaa', fontSize: 13 }}>{euro(subtotaal)}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: '#888', fontSize: 13 }}>BTW</Text>
                <Text style={{ color: '#aaa', fontSize: 13 }}>{euro(totaalBtw)}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '800' }}>Totaal incl. BTW</Text>
                <Text style={{ color: '#C9A84C', fontSize: 15, fontWeight: '800' }}>{euro(totaal)}</Text>
              </View>
            </View>

            <Text style={stijlen.sectieLabel}>NOTITIES (OPTIONEEL)</Text>
            <TextInput style={[stijlen.invoer, { height: 80 }]} placeholder="Bijv. leveringstermijn, betalingsafspraken..." placeholderTextColor="#444" value={notities} onChangeText={setNotities} multiline />
          </ScrollView>
        </View>
      </Modal>

      {/* Offerte detail/voorbeeld modal */}
      <Modal visible={voorbeeldZichtbaar} animationType="slide" onRequestClose={() => setVoorbeeldZichtbaar(false)}>
        {geselecteerdeOfferte && (
          <View style={stijlen.modalScherm}>
            <View style={stijlen.modalKoptekst}>
              <TouchableOpacity onPress={() => setVoorbeeldZichtbaar(false)}>
                <Text style={stijlen.annuleerTekst}>Sluiten</Text>
              </TouchableOpacity>
              <Text style={stijlen.modalTitel}>{geselecteerdeOfferte.offerteNummer}</Text>
              <TouchableOpacity onPress={() => pdfDelen(geselecteerdeOfferte)} disabled={pdfBezig}>
                {pdfBezig ? <ActivityIndicator color="#C9A84C" size="small" /> : <Text style={stijlen.opslaanTekst}>📤 Delen</Text>}
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
              <View style={stijlen.detailKaart}>
                <Text style={stijlen.detailLabel}>KLANT</Text>
                <Text style={stijlen.detailWaarde}>{geselecteerdeOfferte.klantNaam}</Text>
                {geselecteerdeOfferte.klantEmail ? <Text style={stijlen.detailSub}>{geselecteerdeOfferte.klantEmail}</Text> : null}
              </View>
              <View style={stijlen.detailKaart}>
                <Text style={stijlen.detailLabel}>DATUM / GELDIG TOT</Text>
                <Text style={stijlen.detailWaarde}>{geselecteerdeOfferte.datum} → {geselecteerdeOfferte.geldigTot}</Text>
              </View>
              <View style={stijlen.detailKaart}>
                <Text style={stijlen.detailLabel}>STATUS</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {['concept', 'verzonden', 'geaccepteerd', 'verlopen'].map(s => (
                    <TouchableOpacity key={s} style={[stijlen.statusKnop, geselecteerdeOfferte.status === s && { backgroundColor: (statusKleur[s] || '#888') + '33', borderColor: statusKleur[s] || '#888' }]}
                      onPress={async () => {
                        await bijwerken(geselecteerdeOfferte.id, { status: s });
                        setGeselecteerdeOfferte({ ...geselecteerdeOfferte, status: s });
                      }}>
                      <Text style={[stijlen.statusKnopTekst, geselecteerdeOfferte.status === s && { color: statusKleur[s] || '#888' }]}>{statusLabel[s]}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Text style={stijlen.sectieLabel}>REGELS</Text>
              {geselecteerdeOfferte.regels?.map((r: OfferteRegel) => (
                <View key={r.id} style={stijlen.regelRij}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>{r.omschrijving}</Text>
                    <Text style={{ color: '#666', fontSize: 12 }}>{r.aantal}x · {r.btw} · per {r.eenheid}</Text>
                  </View>
                  <Text style={{ color: '#C9A84C', fontSize: 13, fontWeight: '700' }}>
                    {euro(parseFloat(r.aantal || '0') * parseFloat(r.prijs?.replace(',', '.') || '0'))}
                  </Text>
                </View>
              ))}

              {geselecteerdeOfferte.notities ? (
                <View style={stijlen.detailKaart}>
                  <Text style={stijlen.detailLabel}>NOTITIES</Text>
                  <Text style={stijlen.detailSub}>{geselecteerdeOfferte.notities}</Text>
                </View>
              ) : null}

              {geselecteerdeOfferte.status !== 'geaccepteerd' && (
                <TouchableOpacity style={stijlen.omzettenKnop} onPress={() => omzettenNaarFactuur(geselecteerdeOfferte)} activeOpacity={0.8}>
                  <Text style={stijlen.omzettenKnopTekst}>✓ Omzetten naar factuur</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={stijlen.verwijderKnop} onPress={() => {
                Alert.alert('Verwijderen', `Offerte ${geselecteerdeOfferte.offerteNummer} verwijderen?`, [
                  { text: 'Annuleren', style: 'cancel' },
                  { text: 'Verwijderen', style: 'destructive', onPress: async () => { await verwijderen(geselecteerdeOfferte.id); setVoorbeeldZichtbaar(false); } }
                ]);
              }}>
                <Text style={stijlen.verwijderKnopTekst}>🗑️ Offerte verwijderen</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* Klant selecteren modal */}
      <Modal visible={klantModalZichtbaar} animationType="slide" onRequestClose={() => { setKlantModalZichtbaar(false); setTimeout(() => setModalZichtbaar(true), 300); }}>
        <View style={stijlen.modalScherm}>
          <View style={stijlen.modalKoptekst}>
            <TouchableOpacity onPress={() => { setKlantModalZichtbaar(false); setTimeout(() => setModalZichtbaar(true), 300); }}>
              <Text style={stijlen.annuleerTekst}>Terug</Text>
            </TouchableOpacity>
            <Text style={stijlen.modalTitel}>Klant selecteren</Text>
            <View style={{ width: 60 }} />
          </View>
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {klanten.map(klant => (
              <TouchableOpacity key={klant.id} style={stijlen.klantRij} onPress={() => klantSelecteren(klant)}>
                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>{klant.bedrijfsnaam}</Text>
                {klant.email ? <Text style={{ color: '#666', fontSize: 13 }}>{klant.email}</Text> : null}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Product selecteren modal */}
      <Modal visible={productModalZichtbaar} animationType="slide" onRequestClose={() => { setProductModalZichtbaar(false); setTimeout(() => setModalZichtbaar(true), 300); }}>
        <View style={stijlen.modalScherm}>
          <View style={stijlen.modalKoptekst}>
            <TouchableOpacity onPress={() => { setProductModalZichtbaar(false); setTimeout(() => setModalZichtbaar(true), 300); }}>
              <Text style={stijlen.annuleerTekst}>Terug</Text>
            </TouchableOpacity>
            <Text style={stijlen.modalTitel}>Product selecteren</Text>
            <View style={{ width: 60 }} />
          </View>
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {producten.map(product => (
              <TouchableOpacity key={product.id} style={stijlen.klantRij} onPress={() => productSelecteren(product)}>
                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>{product.naam}</Text>
                <Text style={{ color: '#C9A84C', fontSize: 13 }}>€ {product.prijs} · {product.btw}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Startnummer instellen modal */}
      <Modal visible={nummerModalZichtbaar} animationType="fade" transparent onRequestClose={() => setNummerModalZichtbaar(false)}>
        <View style={stijlen.overlayAchtergrond}>
          <View style={stijlen.overlayKaart}>
            <Text style={stijlen.overlayTitel}>Offertenummer instellen</Text>
            <Text style={stijlen.overlaySub}>Voer het startnummer in voor de volgende offerte. Het wordt weergegeven als OFR0001, OFR0002, etc.</Text>
            <TextInput
              style={stijlen.invoer}
              placeholder="Bijv. 1"
              placeholderTextColor="#444"
              value={startNummerInvoer}
              onChangeText={setStartNummerInvoer}
              keyboardType="number-pad"
            />
            <Text style={{ color: '#888', fontSize: 12, marginBottom: 16 }}>
              Preview: OFR{String(parseInt(startNummerInvoer) || 1).padStart(4, '0')}
            </Text>
            <TouchableOpacity style={stijlen.omzettenKnop} onPress={startNummerInstellen}>
              <Text style={stijlen.omzettenKnopTekst}>Instellen</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setNummerModalZichtbaar(false)} style={{ marginTop: 12, alignItems: 'center' }}>
              <Text style={{ color: '#666', fontSize: 14 }}>Annuleren</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const stijlen = StyleSheet.create({
  scherm: { flex: 1, backgroundColor: '#1A1A1A' },
  koptekst: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  terugTekst: { color: '#C9A84C', fontSize: 15, fontWeight: '600', width: 60 },
  koptekstTitel: { color: '#fff', fontSize: 16, fontWeight: '800' },
  instellingenKnop: { fontSize: 20, width: 60, textAlign: 'right' },
  toevoegKnop: { backgroundColor: '#FF6B00', margin: 16, padding: 14, borderRadius: 12, alignItems: 'center' },
  toevoegKnopTekst: { color: '#1A1A1A', fontSize: 15, fontWeight: '800' },
  leegScherm: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  leegIcoon: { fontSize: 48, marginBottom: 16 },
  leegTitel: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  leegTekst: { color: '#555', fontSize: 14, textAlign: 'center', lineHeight: 22 },
  offerteKaart: { backgroundColor: '#242424', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2a2a2a' },
  offerteKaartRij: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  offerteNummer: { color: '#fff', fontSize: 15, fontWeight: '800', marginBottom: 2 },
  offerteKlant: { color: '#aaa', fontSize: 13, marginBottom: 2 },
  offerteDatum: { color: '#555', fontSize: 12 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusTekst: { fontSize: 11, fontWeight: '700' },
  deelKnop: { color: '#C9A84C', fontSize: 12, fontWeight: '600' },
  modalScherm: { flex: 1, backgroundColor: '#1A1A1A' },
  modalKoptekst: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  annuleerTekst: { color: '#888', fontSize: 15, width: 80 },
  modalTitel: { color: '#fff', fontSize: 16, fontWeight: '800' },
  opslaanTekst: { color: '#C9A84C', fontSize: 15, fontWeight: '700', width: 80, textAlign: 'right' },
  sectieLabel: { color: '#888', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginTop: 20, marginBottom: 8 },
  invoer: { backgroundColor: '#242424', borderRadius: 10, padding: 14, color: '#fff', fontSize: 14, borderWidth: 1, borderColor: '#333', marginBottom: 10 },
  klantKnop: { backgroundColor: '#242424', borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#333' },
  klantKnopTekst: { color: '#C9A84C', fontSize: 14, fontWeight: '600' },
  regelKaart: { backgroundColor: '#1e1e1e', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#2a2a2a' },
  btwOptie: { backgroundColor: '#2a2a2a', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  btwOptieActief: { backgroundColor: '#C9A84C', borderColor: '#C9A84C' },
  btwOptieTekst: { color: '#888', fontSize: 12, fontWeight: '600' },
  regelToevoegKnop: { borderWidth: 1, borderColor: '#333', borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 16, borderStyle: 'dashed' },
  regelToevoegTekst: { color: '#555', fontSize: 14 },
  totaalKaart: { backgroundColor: '#242424', borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#2a2a2a' },
  detailKaart: { backgroundColor: '#242424', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#2a2a2a' },
  detailLabel: { color: '#888', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 6 },
  detailWaarde: { color: '#fff', fontSize: 14, fontWeight: '600' },
  detailSub: { color: '#666', fontSize: 13, marginTop: 2 },
  statusKnop: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  statusKnopTekst: { color: '#666', fontSize: 12, fontWeight: '600' },
  regelRij: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  omzettenKnop: { backgroundColor: '#4CAF50', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24, marginBottom: 12 },
  omzettenKnopTekst: { color: '#fff', fontSize: 15, fontWeight: '800' },
  verwijderKnop: { padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#f44336' },
  verwijderKnopTekst: { color: '#f44336', fontSize: 14, fontWeight: '600' },
  klantRij: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  overlayAchtergrond: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'center', padding: 24 },
  overlayKaart: { backgroundColor: '#242424', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#2a2a2a' },
  overlayTitel: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 8 },
  overlaySub: { color: '#888', fontSize: 13, lineHeight: 20, marginBottom: 16 },
});
