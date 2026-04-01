import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert, Modal,
  ScrollView,
  StatusBar,
  StyleSheet, Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { gebruikBedrijf, gebruikFacturen, gebruikKlanten, gebruikPakket, gebruikProducten, gebruikTransacties } from '../../hooks/gebruikData';

const BTW_OPTIES = ['21%', '9%', '0%', 'Verlegd', 'Vrijgesteld'];

type FactuurRegel = {
  id: string;
  omschrijving: string;
  aantal: string;
  prijs: string;
  btw: string;
  eenheid: string;
};

function factuurHtml(factuur: any, bedrijf: any, logo: string | null): string {
  const euro = (b: number) => `€ ${b.toFixed(2).replace('.', ',')}`;

  function berekenRegel(r: FactuurRegel): number {
    return parseFloat(r.aantal || '0') * parseFloat(r.prijs?.replace(',', '.') || '0');
  }

  function berekenBtw(r: FactuurRegel): number {
    const sub = berekenRegel(r);
    if (r.btw === '21%') return sub * 0.21;
    if (r.btw === '9%') return sub * 0.09;
    return 0;
  }

  const subtotaal = factuur.regels?.reduce((s: number, r: FactuurRegel) => s + berekenRegel(r), 0) || 0;
  const totaalBtw = factuur.regels?.reduce((s: number, r: FactuurRegel) => s + berekenBtw(r), 0) || 0;
  const totaal = subtotaal + totaalBtw;
  const isCredit = factuur.soort === 'creditnota';

  const regelsHtml = factuur.regels?.map((r: FactuurRegel) => `
    <tr>
      <td style="padding: 10px 8px; border-bottom: 1px solid #f0f0f0;">
        <div style="font-weight: 600; color: #1a1a1a;">${r.omschrijving}</div>
        <div style="font-size: 11px; color: #888; margin-top: 2px;">BTW ${r.btw} — per ${r.eenheid}</div>
      </td>
      <td style="padding: 10px 8px; border-bottom: 1px solid #f0f0f0; text-align: center; color: #555;">${r.aantal}</td>
      <td style="padding: 10px 8px; border-bottom: 1px solid #f0f0f0; text-align: right; color: #555;">${euro(parseFloat(r.prijs?.replace(',', '.') || '0'))}</td>
      <td style="padding: 10px 8px; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: 600; color: #1a1a1a;">${isCredit ? '-' : ''}${euro(berekenRegel(r))}</td>
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
        .factuur-blok { text-align: right; }
        .factuur-label { font-size: 10px; font-weight: 800; letter-spacing: 2px; color: ${isCredit ? '#f44336' : '#C9A84C'}; margin-bottom: 4px; }
        .factuur-nummer { font-size: 24px; font-weight: 900; color: #1a1a1a; }
        .scheidingslijn-goud { border: none; border-top: 2px solid ${isCredit ? '#f44336' : '#C9A84C'}; margin: 24px 0; }
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
        .totaal-rij.hoofd { background: ${isCredit ? '#f44336' : '#1a1a1a'}; color: #fff; padding: 14px 16px; border-radius: 10px; margin-top: 8px; font-size: 15px; font-weight: 800; }
        .totaal-rij.hoofd span:last-child { color: ${isCredit ? '#fff' : '#C9A84C'}; font-size: 18px; }
        .credit-banner { background: #fff0f0; border: 2px solid #f44336; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px; }
        .credit-banner-titel { color: #f44336; font-weight: 800; font-size: 13px; margin-bottom: 4px; }
        .credit-banner-tekst { color: #888; font-size: 12px; }
        .betaling { background: #fff8e8; border: 1px solid #C9A84C; border-radius: 10px; padding: 18px; margin-top: 16px; }
        .betaling-titel { font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: #C9A84C; margin-bottom: 8px; }
        .betaling-info { color: #555; font-size: 13px; line-height: 1.7; }
        .notities { background: #f8f8f8; border-radius: 10px; padding: 18px; margin-top: 24px; }
        .notities-label { font-size: 10px; font-weight: 800; letter-spacing: 1.5px; color: #888; margin-bottom: 8px; }
        .notities-tekst { color: #555; font-size: 13px; line-height: 1.6; }
        .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #f0f0f0; display: flex; justify-content: space-between; }
        .footer-links { color: #aaa; font-size: 11px; line-height: 1.8; }
        .footer-rechts { color: #C9A84C; font-size: 11px; font-weight: 700; }
        .status-badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; }
        .status-concept { background: #f0f0f0; color: #888; }
        .status-verzonden { background: #e8eef8; color: #003DA5; }
        .status-betaald { background: #e8f5e9; color: #4CAF50; }
        .status-creditnota { background: #fff0f0; color: #f44336; }
      </style>
    </head>
    <body>
      <div class="pagina">
        <div class="header">
          <div>
            ${logo ? `<img src="${logo}" class="logo" />` : ''}
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
          <div class="factuur-blok">
            <div class="factuur-label">${isCredit ? 'CREDITNOTA' : 'FACTUUR'}</div>
            <div class="factuur-nummer">${factuur.factuurNummer}</div>
            <div style="margin-top: 8px;">
              <span class="status-badge status-${isCredit ? 'creditnota' : (factuur.status || 'concept')}">
                ${isCredit ? '↩ Creditnota' : factuur.status === 'betaald' ? '✓ Betaald' : factuur.status === 'verzonden' ? '📤 Verzonden' : '📝 Concept'}
              </span>
            </div>
          </div>
        </div>
        ${isCredit ? `
        <div class="credit-banner">
          <div class="credit-banner-titel">↩ CREDITNOTA</div>
          <div class="credit-banner-tekst">Dit is een creditnota${factuur.origineelFactuurNummer ? ' voor factuur ' + factuur.origineelFactuurNummer : ''}. Het bedrag wordt gecrediteerd aan de klant.</div>
        </div>` : ''}
        <hr class="scheidingslijn-goud">
        <div class="datum-rij">
          <div class="datum-item"><label>DATUM</label><span>${factuur.datum}</span></div>
          <div class="datum-item"><label>VERVALDATUM</label><span>${factuur.vervaldatum}</span></div>
          <div class="datum-item"><label>NUMMER</label><span>${factuur.factuurNummer}</span></div>
        </div>
        <div class="klant-sectie">
          <div class="klant-label">FACTUUR AAN</div>
          <div class="klant-naam">${factuur.klantNaam}</div>
          <div class="klant-info">
            ${factuur.klantAdres ? factuur.klantAdres + '<br>' : ''}
            ${factuur.klantEmail ? factuur.klantEmail + '<br>' : ''}
            ${factuur.klantKvk ? 'KvK: ' + factuur.klantKvk + '<br>' : ''}
            ${factuur.klantBtw ? 'BTW: ' + factuur.klantBtw : ''}
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
          <div class="totaal-rij"><span>Subtotaal excl. BTW</span><span>${isCredit ? '-' : ''}${euro(subtotaal)}</span></div>
          <div class="totaal-rij"><span>BTW</span><span>${isCredit ? '-' : ''}${euro(totaalBtw)}</span></div>
          <div class="totaal-rij hoofd"><span>${isCredit ? 'TE CREDITEREN' : 'TOTAAL INCL. BTW'}</span><span>${isCredit ? '-' : ''}${euro(totaal)}</span></div>
        </div>
        ${!isCredit && bedrijf.iban ? `
        <div class="betaling">
          <div class="betaling-titel">BETALINGSINFORMATIE</div>
          <div class="betaling-info">
            IBAN: <strong>${bedrijf.iban}</strong><br>
            ${bedrijf.banknaam ? 'Bank: ' + bedrijf.banknaam + '<br>' : ''}
            Onder vermelding van: <strong>${factuur.factuurNummer}</strong><br>
            Uiterlijk voor: <strong>${factuur.vervaldatum}</strong>
          </div>
        </div>` : ''}
        ${factuur.notities ? `
        <div class="notities">
          <div class="notities-label">NOTITIES</div>
          <div class="notities-tekst">${factuur.notities}</div>
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

export default function FacturenScherm() {
  const router = useRouter();
  const pakket = gebruikPakket();
  const { facturen, laden, toevoegen, bijwerken, verwijderen } = gebruikFacturen();
  const { klanten } = gebruikKlanten();
  const { producten } = gebruikProducten();
  const { bedrijf } = gebruikBedrijf();
  const { toevoegen: transactieToevoegen } = gebruikTransacties();

  // Tabs: facturen | debiteuren
  const [actieveTab, setActieveTab] = useState<'facturen' | 'debiteuren'>('facturen');

  const [modalZichtbaar, setModalZichtbaar] = useState(false);
  const [voorbeeldZichtbaar, setVoorbeeldZichtbaar] = useState(false);
  const [geselecteerdeFactuur, setGeselecteerdeFactuur] = useState<any>(null);
  const [klantModalZichtbaar, setKlantModalZichtbaar] = useState(false);
  const [productModalZichtbaar, setProductModalZichtbaar] = useState(false);
  const [actieveRegelId, setActieveRegelId] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);
  const [pdfBezig, setPdfBezig] = useState(false);
  const [exportBezig, setExportBezig] = useState(false);
  const [exportModalZichtbaar, setExportModalZichtbaar] = useState(false);
  const [vanDatum, setVanDatum] = useState('');
  const [totDatum, setTotDatum] = useState('');
  const [isCreditnota, setIsCreditnota] = useState(false);
  const [origineelFactuurNummer, setOrigineelFactuurNummer] = useState('');

  const [factuurNummer, setFactuurNummer] = useState('');
  const [klantNaam, setKlantNaam] = useState('');
  const [klantEmail, setKlantEmail] = useState('');
  const [klantAdres, setKlantAdres] = useState('');
  const [klantKvk, setKlantKvk] = useState('');
  const [klantBtw, setKlantBtw] = useState('');
  const [datum, setDatum] = useState(new Date().toLocaleDateString('nl-NL'));
  const [vervaldatum, setVervaldatum] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toLocaleDateString('nl-NL');
  });
  const [regels, setRegels] = useState<FactuurRegel[]>([
    { id: '1', omschrijving: '', aantal: '1', prijs: '', btw: '21%', eenheid: 'stuk' }
  ]);
  const [notities, setNotities] = useState('');

  function volgendFactuurNummer(isCredit: boolean): string {
    const jaar = new Date().getFullYear();
    const volgnummer = String(facturen.length + 1).padStart(3, '0');
    return isCredit ? `CN-${jaar}-${volgnummer}` : `${jaar}-${volgnummer}`;
  }

  function nieuweFactuur() {
    if (pakket === 'gratis') {
      Alert.alert('Premium functie', 'Facturen aanmaken is alleen beschikbaar in Premium.', [
        { text: 'Annuleren', style: 'cancel' },
        { text: 'Upgraden', onPress: () => router.push('/(tabs)/abonnement') }
      ]);
      return;
    }
    setIsCreditnota(false);
    setOrigineelFactuurNummer('');
    setFactuurNummer(volgendFactuurNummer(false));
    setKlantNaam(''); setKlantEmail(''); setKlantAdres('');
    setKlantKvk(''); setKlantBtw(''); setNotities('');
    setRegels([{ id: '1', omschrijving: '', aantal: '1', prijs: '', btw: '21%', eenheid: 'stuk' }]);
    setModalZichtbaar(true);
  }

  function nieuweCreditnota(factuur: any) {
    if (pakket === 'gratis') {
      Alert.alert('Premium functie', 'Creditnota aanmaken is alleen beschikbaar in Premium.', [
        { text: 'Annuleren', style: 'cancel' },
        { text: 'Upgraden', onPress: () => router.push('/(tabs)/abonnement') }
      ]);
      return;
    }
    setIsCreditnota(true);
    setOrigineelFactuurNummer(factuur.factuurNummer);
    setFactuurNummer(volgendFactuurNummer(true));
    setKlantNaam(factuur.klantNaam || '');
    setKlantEmail(factuur.klantEmail || '');
    setKlantAdres(factuur.klantAdres || '');
    setKlantKvk(factuur.klantKvk || '');
    setKlantBtw(factuur.klantBtw || '');
    setNotities(`Creditnota voor factuur ${factuur.factuurNummer}`);
    setRegels(factuur.regels?.map((r: FactuurRegel) => ({ ...r, id: Date.now().toString() + r.id })) || [
      { id: '1', omschrijving: '', aantal: '1', prijs: '', btw: '21%', eenheid: 'stuk' }
    ]);
    setVoorbeeldZichtbaar(false);
    setModalZichtbaar(true);
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
    setRegels([...regels, {
      id: Date.now().toString(),
      omschrijving: '', aantal: '1', prijs: '', btw: '21%', eenheid: 'stuk'
    }]);
  }

  function regelBijwerken(id: string, veld: keyof FactuurRegel, waarde: string) {
    setRegels(regels.map(r => r.id === id ? { ...r, [veld]: waarde } : r));
  }

  function regelVerwijderen(id: string) {
    if (regels.length === 1) return;
    setRegels(regels.filter(r => r.id !== id));
  }

  function berekenRegelTotaal(regel: FactuurRegel): number {
    return parseFloat(regel.aantal || '0') * parseFloat(regel.prijs?.replace(',', '.') || '0');
  }

  function berekenBtw(regel: FactuurRegel): number {
    const sub = berekenRegelTotaal(regel);
    if (regel.btw === '21%') return sub * 0.21;
    if (regel.btw === '9%') return sub * 0.09;
    return 0;
  }

  const subtotaal = regels.reduce((s, r) => s + berekenRegelTotaal(r), 0);
  const totaalBtw = regels.reduce((s, r) => s + berekenBtw(r), 0);
  const totaal = subtotaal + totaalBtw;

  function euro(b: number) {
    return `€ ${b.toFixed(2).replace('.', ',')}`;
  }

  async function factuurOpslaan() {
    if (!klantNaam || regels.some(r => !r.omschrijving || !r.prijs)) {
      Alert.alert('Verplichte velden', 'Vul klantnaam en alle regelomschrijvingen en prijzen in.');
      return;
    }
    setBezig(true);
    try {
      await toevoegen({
        factuurNummer, klantNaam, klantEmail, klantAdres,
        klantKvk, klantBtw, datum, vervaldatum,
        regels, status: isCreditnota ? 'creditnota' : 'concept',
        soort: isCreditnota ? 'creditnota' : 'factuur',
        notities,
        origineelFactuurNummer: isCreditnota ? origineelFactuurNummer : null,
      });

      const btwBedrag21 = regels.filter(r => r.btw === '21%').reduce((s, r) => s + berekenBtw(r), 0);
      const btwBedrag9 = regels.filter(r => r.btw === '9%').reduce((s, r) => s + berekenBtw(r), 0);
      const totaalBtwBedrag = btwBedrag21 + btwBedrag9;
      const btwTarief = btwBedrag21 > 0 ? '21%' : btwBedrag9 > 0 ? '9%' : '0%';

      await transactieToevoegen({
        omschrijving: isCreditnota
          ? `Creditnota ${factuurNummer} — ${klantNaam}`
          : `Factuur ${factuurNummer} — ${klantNaam}`,
        bedrag: totaal.toFixed(2),
        soort: isCreditnota ? 'uitgave' : 'inkomst',
        categorie: isCreditnota ? 'Overige kosten' : 'Omzet diensten',
        datum: datum,
        btwTarief: btwTarief,
        btwBedrag: totaalBtwBedrag.toFixed(2),
        factuurNummer: factuurNummer,
      });

      setModalZichtbaar(false);
      Alert.alert(
        'Opgeslagen',
        isCreditnota
          ? `Creditnota ${factuurNummer} is aangemaakt.`
          : `Factuur ${factuurNummer} is aangemaakt en als inkomst geregistreerd.`
      );
    } catch (e) {
      Alert.alert('Fout', 'Kon factuur niet opslaan. Probeer opnieuw.');
    } finally {
      setBezig(false);
    }
  }

  async function statusBijwerken(id: string, nieuwStatus: string) {
    await bijwerken(id, { status: nieuwStatus });
    if (geselecteerdeFactuur?.id === id) {
      setGeselecteerdeFactuur({ ...geselecteerdeFactuur, status: nieuwStatus });
    }
  }

  async function pdfDelenVanFactuur(factuur: any) {
    if (pakket === 'gratis') {
      Alert.alert('Premium functie', 'PDF delen is alleen beschikbaar in Premium.', [
        { text: 'Annuleren', style: 'cancel' },
        { text: 'Upgraden', onPress: () => router.push('/(tabs)/abonnement') }
      ]);
      return;
    }
    setPdfBezig(true);
    try {
      const html = factuurHtml(factuur, bedrijf, null);
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      const deelbaar = await Sharing.isAvailableAsync();
      if (deelbaar) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Factuur ${factuur.factuurNummer} delen`,
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Niet beschikbaar', 'Delen is niet beschikbaar op dit apparaat.');
      }
    } catch (e) {
      Alert.alert('Fout', 'Kon PDF niet aanmaken. Probeer opnieuw.');
    } finally {
      setPdfBezig(false);
    }
  }

  async function pdfAfdrukken(factuur: any) {
    if (pakket === 'gratis') {
      Alert.alert('Premium functie', 'Afdrukken is alleen beschikbaar in Premium.', [
        { text: 'Annuleren', style: 'cancel' },
        { text: 'Upgraden', onPress: () => router.push('/(tabs)/abonnement') }
      ]);
      return;
    }
    setPdfBezig(true);
    try {
      const html = factuurHtml(factuur, bedrijf, null);
      await Print.printAsync({ html });
    } catch (e) {
      Alert.alert('Fout', 'Kon factuur niet afdrukken.');
    } finally {
      setPdfBezig(false);
    }
  }

  function snelPeriodeFacturen(type: 'deze-maand' | 'vorige-maand' | 'kwartaal' | 'jaar') {
    const nu = new Date();
    const j = nu.getFullYear();
    const m = nu.getMonth();
    if (type === 'deze-maand') {
      setVanDatum(`${j}-${String(m + 1).padStart(2, '0')}-01`);
      setTotDatum(`${j}-${String(m + 1).padStart(2, '0')}-${new Date(j, m + 1, 0).getDate()}`);
    } else if (type === 'vorige-maand') {
      const vm = m === 0 ? 11 : m - 1;
      const vj = m === 0 ? j - 1 : j;
      setVanDatum(`${vj}-${String(vm + 1).padStart(2, '0')}-01`);
      setTotDatum(`${vj}-${String(vm + 1).padStart(2, '0')}-${new Date(vj, vm + 1, 0).getDate()}`);
    } else if (type === 'kwartaal') {
      const kw = Math.floor(m / 3);
      setVanDatum(`${j}-${String(kw * 3 + 1).padStart(2, '0')}-01`);
      setTotDatum(`${j}-${String(kw * 3 + 3).padStart(2, '0')}-${new Date(j, kw * 3 + 3, 0).getDate()}`);
    } else if (type === 'jaar') {
      setVanDatum(`${j}-01-01`);
      setTotDatum(`${j}-12-31`);
    }
  }

  async function alleFacturenExporteren() {
    if (pakket === 'gratis') {
      Alert.alert('Premium functie', 'Exporteren is alleen beschikbaar in Premium.', [
        { text: 'Annuleren', style: 'cancel' },
        { text: 'Upgraden', onPress: () => router.push('/(tabs)/abonnement') }
      ]);
      return;
    }
    if (!vanDatum || !totDatum) {
      Alert.alert('Selecteer periode', 'Vul een begin- en einddatum in.');
      return;
    }
    const gefilterd = [...facturen]
      .filter(f => {
        const d = f.aangemaaktOp?.slice(0, 10) || '';
        return d >= vanDatum && d <= totDatum;
      })
      .sort((a, b) => b.aangemaaktOp?.localeCompare(a.aangemaaktOp));

    if (gefilterd.length === 0) {
      Alert.alert('Geen facturen', 'Er zijn geen facturen in deze periode.');
      return;
    }
    setExportBezig(true);
    try {
      const alleHtml = gefilterd
        .map(f => factuurHtml(f, bedrijf, null))
        .join('<div style="page-break-after: always;"></div>');

      const volledigeHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8">
        <style>body { margin: 0; }</style></head>
        <body>${alleHtml}</body></html>`;
      const { uri } = await Print.printToFileAsync({ html: volledigeHtml, base64: false });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
      setExportModalZichtbaar(false);
    } catch (e) {
      Alert.alert('Fout', 'Kon facturen niet exporteren.');
    } finally {
      setExportBezig(false);
    }
  }

  // ── DEBITEUREN berekening ──
  function berekenDebiteuren() {
    const klantMap: Record<string, {
      naam: string;
      facturen: any[];
      totaalGefactureerd: number;
      totaalBetaald: number;
      openstaand: number;
    }> = {};

    facturen
      .filter(f => f.soort !== 'creditnota')
      .forEach(f => {
        const totaalF = f.regels?.reduce((s: number, r: FactuurRegel) =>
          s + berekenRegelTotaal(r) + berekenBtw(r), 0) || 0;

        if (!klantMap[f.klantNaam]) {
          klantMap[f.klantNaam] = {
            naam: f.klantNaam,
            facturen: [],
            totaalGefactureerd: 0,
            totaalBetaald: 0,
            openstaand: 0,
          };
        }
        klantMap[f.klantNaam].facturen.push(f);
        klantMap[f.klantNaam].totaalGefactureerd += totaalF;
        if (f.status === 'betaald') {
          klantMap[f.klantNaam].totaalBetaald += totaalF;
        }
      });

    Object.values(klantMap).forEach(k => {
      k.openstaand = k.totaalGefactureerd - k.totaalBetaald;
    });

    return Object.values(klantMap).sort((a, b) => b.openstaand - a.openstaand);
  }

  const debiteuren = berekenDebiteuren();

  function statusKleur(status: string): string {
    if (status === 'betaald') return '#4CAF50';
    if (status === 'verzonden') return '#003DA5';
    if (status === 'creditnota') return '#f44336';
    return '#888';
  }

  function statusLabel(status: string): string {
    if (status === 'betaald') return '✓ Betaald';
    if (status === 'verzonden') return '📤 Verzonden';
    if (status === 'creditnota') return '↩ Creditnota';
    return '📝 Concept';
  }

  const alleFacturen = [...facturen].sort((a, b) => b.aangemaaktOp?.localeCompare(a.aangemaaktOp));

  return (
    <View style={stijlen.scherm}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />

      <View style={stijlen.koptekst}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/instellingen')}>
          <Text style={stijlen.terugTekst}>← Terug</Text>
        </TouchableOpacity>
        <Text style={stijlen.koptekstTitel}>Facturen</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {exportBezig ? (
            <ActivityIndicator color="#C9A84C" />
          ) : (
            <TouchableOpacity onPress={() => {
              if (pakket !== 'premium') {
                Alert.alert('Premium functie', 'Exporteren is alleen beschikbaar in het Premium pakket.', [
                  { text: 'Annuleren', style: 'cancel' },
                  { text: 'Upgraden', onPress: () => router.push('/(tabs)/abonnement') },
                ]);
                return;
              }
              setExportModalZichtbaar(true);
            }}>
              <Text style={stijlen.exportKnopTekst}>PDF</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={stijlen.toevoegenKnop} onPress={nieuweFactuur}>
            <Text style={stijlen.toevoegenTekst}>+ Nieuw</Text>
          </TouchableOpacity>
        </View>
      </View>

      {pakket === 'gratis' && (
        <View style={stijlen.premiumBalk}>
          <Text style={stijlen.premiumBalkTekst}>🔒 Facturen vereist Premium — vanaf €9,99/maand</Text>
        </View>
      )}

      {/* TABS */}
      <View style={stijlen.tabBar}>
        <TouchableOpacity
          style={[stijlen.tab, actieveTab === 'facturen' && stijlen.tabActief]}
          onPress={() => setActieveTab('facturen')}>
          <Text style={[stijlen.tabTekst, actieveTab === 'facturen' && stijlen.tabTekstActief]}>📄 Facturen</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[stijlen.tab, actieveTab === 'debiteuren' && stijlen.tabActief]}
          onPress={() => setActieveTab('debiteuren')}>
          <Text style={[stijlen.tabTekst, actieveTab === 'debiteuren' && stijlen.tabTekstActief]}>👥 Debiteuren</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={stijlen.scrollInhoud}>
        {laden ? (
          <ActivityIndicator color="#C9A84C" style={{ marginTop: 40 }} />

        ) : actieveTab === 'facturen' ? (
          // ── FACTUREN TAB ──
          alleFacturen.length === 0 ? (
            <View style={stijlen.legeKaart}>
              <Text style={stijlen.leegIcoon}>📄</Text>
              <Text style={stijlen.leegeTekst}>Nog geen facturen</Text>
              <Text style={stijlen.leegeOndertekst}>
                {pakket === 'gratis'
                  ? 'Upgrade naar Premium om facturen aan te maken'
                  : 'Maak uw eerste factuur aan via de knop rechtsboven'}
              </Text>
              {pakket === 'gratis' && (
                <TouchableOpacity style={stijlen.upgradeKnop} onPress={() => router.push('/(tabs)/abonnement')}>
                  <Text style={stijlen.upgradeKnopTekst}>⚡ Upgraden naar Premium</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
            <View style={stijlen.creditnotaTip}>
              <Text style={stijlen.creditnotaTipTekst}>💡 Tip: Tik op een factuur om een creditnota aan te maken</Text>
            </View>
            {alleFacturen.map(factuur => (
              <TouchableOpacity
                key={factuur.id}
                style={[stijlen.factuurKaart, factuur.soort === 'creditnota' && stijlen.creditKaart]}
                onPress={() => { setGeselecteerdeFactuur(factuur); setVoorbeeldZichtbaar(true); }}
                activeOpacity={0.8}>
                <View style={stijlen.factuurKoptekst}>
                  <View>
                    <Text style={[stijlen.factuurNummer, factuur.soort === 'creditnota' && { color: '#f44336' }]}>
                      {factuur.soort === 'creditnota' ? '↩ ' : ''}{factuur.factuurNummer}
                    </Text>
                    <Text style={stijlen.factuurKlant}>{factuur.klantNaam}</Text>
                  </View>
                  <View style={stijlen.factuurRechts}>
                    <Text style={[stijlen.factuurTotaal, factuur.soort === 'creditnota' && { color: '#f44336' }]}>
                      {factuur.soort === 'creditnota' ? '-' : ''}
                      {euro(factuur.regels?.reduce((s: number, r: FactuurRegel) =>
                        s + berekenRegelTotaal(r) + berekenBtw(r), 0) || 0)}
                    </Text>
                    <View style={[stijlen.statusBadge, {
                      backgroundColor: statusKleur(factuur.status) + '22',
                      borderColor: statusKleur(factuur.status)
                    }]}>
                      <Text style={[stijlen.statusTekst, { color: statusKleur(factuur.status) }]}>
                        {statusLabel(factuur.status)}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={stijlen.factuurMeta}>
                  <Text style={stijlen.factuurMetaTekst}>📅 {factuur.datum}</Text>
                  <Text style={stijlen.factuurMetaTekst}>⏰ Vervalt: {factuur.vervaldatum}</Text>
                  <TouchableOpacity style={stijlen.snelDelenKnop} onPress={() => pdfDelenVanFactuur(factuur)}>
                    <Text style={stijlen.snelDelenTekst}>📤 Delen</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
            </>
          )

        ) : (
          // ── DEBITEUREN TAB ──
          debiteuren.length === 0 ? (
            <View style={stijlen.legeKaart}>
              <Text style={stijlen.leegIcoon}>👥</Text>
              <Text style={stijlen.leegeTekst}>Geen debiteuren</Text>
              <Text style={stijlen.leegeOndertekst}>Maak eerst facturen aan om debiteuren te zien</Text>
            </View>
          ) : (
            <>
              {/* Samenvatting bovenaan */}
              <View style={stijlen.debiteurenSamenvatting}>
                <View style={stijlen.samenvattingItem}>
                  <Text style={stijlen.samenvattingLabel}>Totaal gefactureerd</Text>
                  <Text style={stijlen.samenvattingBedrag}>
                    {euro(debiteuren.reduce((s, d) => s + d.totaalGefactureerd, 0))}
                  </Text>
                </View>
                <View style={stijlen.samenvattingItem}>
                  <Text style={stijlen.samenvattingLabel}>Ontvangen</Text>
                  <Text style={[stijlen.samenvattingBedrag, { color: '#4CAF50' }]}>
                    {euro(debiteuren.reduce((s, d) => s + d.totaalBetaald, 0))}
                  </Text>
                </View>
                <View style={stijlen.samenvattingItem}>
                  <Text style={stijlen.samenvattingLabel}>Openstaand</Text>
                  <Text style={[stijlen.samenvattingBedrag, { color: '#FF6B00' }]}>
                    {euro(debiteuren.reduce((s, d) => s + d.openstaand, 0))}
                  </Text>
                </View>
              </View>

              {/* Per klant */}
              {debiteuren.map((debiteur, index) => (
                <View key={index} style={stijlen.debiteurKaart}>
                  <View style={stijlen.debiteurKoptekst}>
                    <View style={stijlen.debiteurAvatar}>
                      <Text style={stijlen.debiteurAvatarTekst}>
                        {debiteur.naam?.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={stijlen.debiteurNaam}>{debiteur.naam}</Text>
                      <Text style={stijlen.debiteurAantal}>{debiteur.facturen.length} factuur{debiteur.facturen.length !== 1 ? 'en' : ''}</Text>
                    </View>
                    <View style={[stijlen.openstaandBadge, { backgroundColor: debiteur.openstaand > 0 ? '#2e1a0e' : '#1a2e1a' }]}>
                      <Text style={[stijlen.openstaandTekst, { color: debiteur.openstaand > 0 ? '#FF6B00' : '#4CAF50' }]}>
                        {debiteur.openstaand > 0 ? '⚠️ Open' : '✓ Voldaan'}
                      </Text>
                    </View>
                  </View>

                  <View style={stijlen.debiteurRijen}>
                    <View style={stijlen.debiteurRij}>
                      <Text style={stijlen.debiteurRijLabel}>Gefactureerd</Text>
                      <Text style={stijlen.debiteurRijBedrag}>{euro(debiteur.totaalGefactureerd)}</Text>
                    </View>
                    <View style={stijlen.debiteurRij}>
                      <Text style={stijlen.debiteurRijLabel}>Ontvangen</Text>
                      <Text style={[stijlen.debiteurRijBedrag, { color: '#4CAF50' }]}>{euro(debiteur.totaalBetaald)}</Text>
                    </View>
                    <View style={[stijlen.debiteurRij, stijlen.debiteurRijGroot]}>
                      <Text style={stijlen.debiteurRijLabelGroot}>Openstaand</Text>
                      <Text style={[stijlen.debiteurRijBedragGroot, { color: debiteur.openstaand > 0 ? '#FF6B00' : '#4CAF50' }]}>
                        {euro(debiteur.openstaand)}
                      </Text>
                    </View>
                  </View>

                  {/* Factuurlijst per klant */}
                  {debiteur.facturen
                    .sort((a, b) => b.aangemaaktOp?.localeCompare(a.aangemaaktOp))
                    .map(f => (
                      <TouchableOpacity
                        key={f.id}
                        style={stijlen.debiteurFactuurregel}
                        onPress={() => { setGeselecteerdeFactuur(f); setVoorbeeldZichtbaar(true); }}>
                        <Text style={stijlen.debiteurFactuurNummer}>{f.factuurNummer}</Text>
                        <Text style={stijlen.debiteurFactuurDatum}>{f.datum}</Text>
                        <Text style={[stijlen.debiteurFactuurBedrag, { color: statusKleur(f.status) }]}>
                          {euro(f.regels?.reduce((s: number, r: FactuurRegel) =>
                            s + berekenRegelTotaal(r) + berekenBtw(r), 0) || 0)}
                        </Text>
                        <View style={[stijlen.miniStatusBadge, { backgroundColor: statusKleur(f.status) + '22' }]}>
                          <Text style={[stijlen.miniStatusTekst, { color: statusKleur(f.status) }]}>
                            {f.status === 'betaald' ? '✓' : f.status === 'verzonden' ? '📤' : '📝'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                </View>
              ))}
            </>
          )
        )}
      </ScrollView>

      {/* FACTUUR AANMAKEN MODAL */}
      <Modal visible={modalZichtbaar} animationType="slide" presentationStyle="pageSheet">
        <View style={stijlen.modalScherm}>
          <View style={stijlen.modalKoptekst}>
            <TouchableOpacity onPress={() => setModalZichtbaar(false)}>
              <Text style={stijlen.annulerenTekst}>Annuleren</Text>
            </TouchableOpacity>
            <Text style={stijlen.modalTitel}>{isCreditnota ? 'Creditnota aanmaken' : 'Factuur aanmaken'}</Text>
            <TouchableOpacity onPress={factuurOpslaan} disabled={bezig}>
              <Text style={stijlen.opslaanTekst}>{bezig ? '...' : 'Opslaan'}</Text>
            </TouchableOpacity>
          </View>

          {isCreditnota && (
            <View style={stijlen.creditBanner}>
              <Text style={stijlen.creditBannerTekst}>↩ Creditnota voor factuur {origineelFactuurNummer}</Text>
            </View>
          )}

          <ScrollView contentContainerStyle={stijlen.modalInhoud} keyboardShouldPersistTaps="handled">
            <View style={stijlen.sectieKader}>
              <Text style={stijlen.sectieKoptekst}>📄 {isCreditnota ? 'Creditnota' : 'Factuur'}gegevens</Text>
              <View style={stijlen.tweeKolommen}>
                <View style={[stijlen.invoerGroep, { flex: 1 }]}>
                  <Text style={stijlen.label}>Nummer</Text>
                  <TextInput style={stijlen.invoer} value={factuurNummer} onChangeText={setFactuurNummer} placeholderTextColor="#444" />
                </View>
                <View style={[stijlen.invoerGroep, { flex: 1 }]}>
                  <Text style={stijlen.label}>Datum</Text>
                  <TextInput style={stijlen.invoer} value={datum} onChangeText={setDatum} placeholderTextColor="#444" />
                </View>
              </View>
              <View style={stijlen.invoerGroep}>
                <Text style={stijlen.label}>Vervaldatum</Text>
                <TextInput style={stijlen.invoer} value={vervaldatum} onChangeText={setVervaldatum} placeholderTextColor="#444" />
              </View>
            </View>

            <View style={stijlen.sectieKader}>
              <View style={stijlen.sectieKoptekstRij}>
                <Text style={stijlen.sectieKoptekst}>👥 Klantgegevens</Text>
                {klanten.length > 0 && (
                  <TouchableOpacity style={stijlen.selecteerKnop} onPress={() => { setModalZichtbaar(false); setKlantModalZichtbaar(true); }}>
                    <Text style={stijlen.selecteerKnopTekst}>📋 Kies klant</Text>
                  </TouchableOpacity>
                )}
              </View>
              {klantNaam ? (
                <View style={stijlen.geselecteerdKaart}>
                  <Text style={stijlen.geselecteerdNaam}>{klantNaam}</Text>
                  {klantEmail ? <Text style={stijlen.geselecteerdInfo}>✉️ {klantEmail}</Text> : null}
                  {klantAdres ? <Text style={stijlen.geselecteerdInfo}>📍 {klantAdres}</Text> : null}
                  {klantKvk ? <Text style={stijlen.geselecteerdInfo}>🏢 KvK: {klantKvk}</Text> : null}
                  <TouchableOpacity onPress={() => { setKlantNaam(''); setKlantEmail(''); setKlantAdres(''); setKlantKvk(''); setKlantBtw(''); }}>
                    <Text style={stijlen.wissenTekst}>✕ Klant wissen</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={stijlen.invoerGroep}>
                  <Text style={stijlen.label}>Naam / Bedrijfsnaam <Text style={stijlen.verplicht}>*</Text></Text>
                  <TextInput style={stijlen.invoer} placeholder="Naam klant of bedrijf" placeholderTextColor="#444" value={klantNaam} onChangeText={setKlantNaam} />
                  <TextInput style={[stijlen.invoer, { marginTop: 8 }]} placeholder="E-mailadres" placeholderTextColor="#444" keyboardType="email-address" autoCapitalize="none" value={klantEmail} onChangeText={setKlantEmail} />
                  <TextInput style={[stijlen.invoer, { marginTop: 8 }]} placeholder="Adres" placeholderTextColor="#444" value={klantAdres} onChangeText={setKlantAdres} />
                  <View style={[stijlen.tweeKolommen, { marginTop: 8 }]}>
                    <TextInput style={[stijlen.invoer, { flex: 1 }]} placeholder="KvK-nummer" placeholderTextColor="#444" keyboardType="numeric" value={klantKvk} onChangeText={setKlantKvk} />
                    <TextInput style={[stijlen.invoer, { flex: 1 }]} placeholder="BTW-nummer" placeholderTextColor="#444" autoCapitalize="characters" value={klantBtw} onChangeText={setKlantBtw} />
                  </View>
                </View>
              )}
            </View>

            <View style={stijlen.sectieKader}>
              <Text style={stijlen.sectieKoptekst}>📦 Regels</Text>
              {regels.map((regel, index) => (
                <View key={regel.id} style={stijlen.regelKaart}>
                  <View style={stijlen.regelKoptekst}>
                    <Text style={stijlen.regelNummer}>Regel {index + 1}</Text>
                    <View style={stijlen.regelActies}>
                      {producten.length > 0 && (
                        <TouchableOpacity
                          style={stijlen.productSelecteerKnop}
                          onPress={() => { setActieveRegelId(regel.id); setModalZichtbaar(false); setProductModalZichtbaar(true); }}>
                          <Text style={stijlen.productSelecteerTekst}>📦 Kies product</Text>
                        </TouchableOpacity>
                      )}
                      {regels.length > 1 && (
                        <TouchableOpacity onPress={() => regelVerwijderen(regel.id)}>
                          <Text style={stijlen.regelVerwijderen}>✕</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                  <View style={stijlen.invoerGroep}>
                    <Text style={stijlen.label}>Omschrijving <Text style={stijlen.verplicht}>*</Text></Text>
                    <TextInput style={stijlen.invoer} placeholder="Bijv. Webdesign, Advies..." placeholderTextColor="#444" value={regel.omschrijving} onChangeText={v => regelBijwerken(regel.id, 'omschrijving', v)} />
                  </View>
                  <View style={stijlen.tweeKolommen}>
                    <View style={[stijlen.invoerGroep, { flex: 1 }]}>
                      <Text style={stijlen.label}>Aantal</Text>
                      <TextInput style={stijlen.invoer} placeholder="1" placeholderTextColor="#444" keyboardType="decimal-pad" value={regel.aantal} onChangeText={v => regelBijwerken(regel.id, 'aantal', v)} />
                    </View>
                    <View style={[stijlen.invoerGroep, { flex: 1 }]}>
                      <Text style={stijlen.label}>Eenheid</Text>
                      <TextInput style={stijlen.invoer} placeholder="uur / stuk" placeholderTextColor="#444" value={regel.eenheid} onChangeText={v => regelBijwerken(regel.id, 'eenheid', v)} />
                    </View>
                  </View>
                  <View style={stijlen.invoerGroep}>
                    <Text style={stijlen.label}>Prijs excl. BTW <Text style={stijlen.verplicht}>*</Text></Text>
                    <View style={stijlen.bedragRij}>
                      <Text style={stijlen.euroTekst}>€</Text>
                      <TextInput style={stijlen.bedragInvoer} placeholder="0,00" placeholderTextColor="#444" keyboardType="decimal-pad" value={regel.prijs} onChangeText={v => regelBijwerken(regel.id, 'prijs', v)} />
                    </View>
                  </View>
                  <View style={stijlen.invoerGroep}>
                    <Text style={stijlen.label}>BTW tarief</Text>
                    <View style={stijlen.btwOpties}>
                      {BTW_OPTIES.map(o => (
                        <TouchableOpacity
                          key={o}
                          style={[stijlen.btwOptie, regel.btw === o && stijlen.btwOptieActief]}
                          onPress={() => regelBijwerken(regel.id, 'btw', o)}>
                          <Text style={[stijlen.btwOptieTekst, regel.btw === o && stijlen.btwOptieTekstActief]}>{o}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  {regel.prijs.length > 0 && (
                    <View style={stijlen.regelTotaalRij}>
                      <Text style={stijlen.regelTotaalLabel}>Subtotaal incl. BTW:</Text>
                      <Text style={stijlen.regelTotaalBedrag}>{euro(berekenRegelTotaal(regel) + berekenBtw(regel))}</Text>
                    </View>
                  )}
                </View>
              ))}
              <TouchableOpacity style={stijlen.regelToevoegenKnop} onPress={regelToevoegen}>
                <Text style={stijlen.regelToevoegenTekst}>+ Regel toevoegen</Text>
              </TouchableOpacity>
            </View>

            <View style={stijlen.totaalKaart}>
              <Text style={stijlen.totaalTitel}>{isCreditnota ? 'TE CREDITEREN' : 'TOTAALOVERZICHT'}</Text>
              <View style={stijlen.totaalRij}>
                <Text style={stijlen.totaalLabel}>Subtotaal excl. BTW</Text>
                <Text style={stijlen.totaalBedrag}>{isCreditnota ? '-' : ''}{euro(subtotaal)}</Text>
              </View>
              <View style={stijlen.totaalRij}>
                <Text style={stijlen.totaalLabel}>BTW</Text>
                <Text style={stijlen.totaalBedrag}>{isCreditnota ? '-' : ''}{euro(totaalBtw)}</Text>
              </View>
              <View style={stijlen.totaalScheidingslijn} />
              <View style={stijlen.totaalRij}>
                <Text style={stijlen.totaalLabelGroot}>{isCreditnota ? 'Totaal te crediteren' : 'Totaal incl. BTW'}</Text>
                <Text style={[stijlen.totaalBedragGroot, isCreditnota && { color: '#f44336' }]}>
                  {isCreditnota ? '-' : ''}{euro(totaal)}
                </Text>
              </View>
            </View>

            <View style={stijlen.sectieKader}>
              <Text style={stijlen.sectieKoptekst}>📝 Notities</Text>
              <TextInput
                style={[stijlen.invoer, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Bijv. betalingsinstructies, referentie..."
                placeholderTextColor="#444"
                multiline
                value={notities}
                onChangeText={setNotities}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* KLANT SELECTIE MODAL */}
      <Modal visible={klantModalZichtbaar} animationType="slide" presentationStyle="fullScreen">
        <View style={stijlen.modalScherm}>
          <View style={stijlen.modalKoptekst}>
            <TouchableOpacity onPress={() => { setKlantModalZichtbaar(false); setTimeout(() => setModalZichtbaar(true), 300); }}>
              <Text style={stijlen.annulerenTekst}>Annuleren</Text>
            </TouchableOpacity>
            <Text style={stijlen.modalTitel}>Klant selecteren</Text>
            <View style={{ width: 80 }} />
          </View>
          <ScrollView contentContainerStyle={stijlen.modalInhoud}>
            {klanten.map(klant => (
              <TouchableOpacity key={klant.id} style={stijlen.selectieKaart} onPress={() => klantSelecteren(klant)}>
                <View style={stijlen.klantAvatar}>
                  <Text style={stijlen.klantAvatarTekst}>{klant.bedrijfsnaam?.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={stijlen.selectieInfo}>
                  <Text style={stijlen.selectieNaam}>{klant.bedrijfsnaam}</Text>
                  {klant.contactpersoon ? <Text style={stijlen.selectieDetail}>{klant.contactpersoon}</Text> : null}
                  {klant.email ? <Text style={stijlen.selectieDetail}>✉️ {klant.email}</Text> : null}
                </View>
                <Text style={stijlen.selectiePijl}>›</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* PRODUCT SELECTIE MODAL */}
      <Modal visible={productModalZichtbaar} animationType="slide" presentationStyle="fullScreen">
        <View style={stijlen.modalScherm}>
          <View style={stijlen.modalKoptekst}>
            <TouchableOpacity onPress={() => { setProductModalZichtbaar(false); setActieveRegelId(null); setTimeout(() => setModalZichtbaar(true), 300); }}>
              <Text style={stijlen.annulerenTekst}>Annuleren</Text>
            </TouchableOpacity>
            <Text style={stijlen.modalTitel}>Product selecteren</Text>
            <View style={{ width: 80 }} />
          </View>
          <ScrollView contentContainerStyle={stijlen.modalInhoud}>
            {producten.map(product => (
              <TouchableOpacity key={product.id} style={stijlen.selectieKaart} onPress={() => productSelecteren(product)}>
                <View style={stijlen.selectieInfo}>
                  <Text style={stijlen.selectieNaam}>{product.naam}</Text>
                  <Text style={stijlen.selectieDetail}>
                    € {parseFloat(product.prijs?.replace(',', '.') || '0').toFixed(2).replace('.', ',')} / {product.eenheid} — BTW {product.btw}
                  </Text>
                  {product.omschrijving ? <Text style={stijlen.selectieDetail}>{product.omschrijving}</Text> : null}
                </View>
                <Text style={stijlen.selectiePijl}>›</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* FACTUUR DETAIL MODAL */}
      <Modal visible={voorbeeldZichtbaar} animationType="slide" presentationStyle="pageSheet">
        {geselecteerdeFactuur && (
          <View style={stijlen.modalScherm}>
            <View style={stijlen.modalKoptekst}>
              <TouchableOpacity onPress={() => setVoorbeeldZichtbaar(false)}>
                <Text style={stijlen.annulerenTekst}>← Terug</Text>
              </TouchableOpacity>
              <Text style={stijlen.modalTitel}>{geselecteerdeFactuur.factuurNummer}</Text>
              <View style={{ width: 80 }} />
            </View>

            <ScrollView contentContainerStyle={stijlen.voorbeeldInhoud}>
              <View style={stijlen.voorbeeldKaart}>
                <View style={stijlen.voorbeeldHeader}>
                  <View>
                    <Text style={stijlen.voorbeeldBedrijfsnaam}>{bedrijf.bedrijfsnaam || 'Uw Bedrijfsnaam'}</Text>
                    {bedrijf.kvkNummer ? <Text style={stijlen.voorbeeldBedrijfInfo}>KvK: {bedrijf.kvkNummer}</Text> : null}
                    {bedrijf.btwNummer ? <Text style={stijlen.voorbeeldBedrijfInfo}>BTW: {bedrijf.btwNummer}</Text> : null}
                    {bedrijf.iban ? <Text style={stijlen.voorbeeldBedrijfInfo}>IBAN: {bedrijf.iban}</Text> : null}
                    {bedrijf.email ? <Text style={stijlen.voorbeeldBedrijfInfo}>{bedrijf.email}</Text> : null}
                  </View>
                  <View style={stijlen.factuurNummerBlok}>
                    <Text style={[stijlen.factuurNummerLabel, geselecteerdeFactuur.soort === 'creditnota' && { color: '#f44336' }]}>
                      {geselecteerdeFactuur.soort === 'creditnota' ? 'CREDITNOTA' : 'FACTUUR'}
                    </Text>
                    <Text style={stijlen.factuurNummerWaarde}>{geselecteerdeFactuur.factuurNummer}</Text>
                  </View>
                </View>

                {geselecteerdeFactuur.soort === 'creditnota' && (
                  <View style={stijlen.creditBannerVoorbeeld}>
                    <Text style={stijlen.creditBannerVoorbeeldTekst}>
                      ↩ Creditnota{geselecteerdeFactuur.origineelFactuurNummer ? ` voor factuur ${geselecteerdeFactuur.origineelFactuurNummer}` : ''}
                    </Text>
                  </View>
                )}

                <View style={stijlen.voorbeeldScheidingslijn} />
                <View style={stijlen.voorbeeldDatumRij}>
                  <View>
                    <Text style={stijlen.voorbeeldDatumLabel}>Datum</Text>
                    <Text style={stijlen.voorbeeldDatumWaarde}>{geselecteerdeFactuur.datum}</Text>
                  </View>
                  <View>
                    <Text style={stijlen.voorbeeldDatumLabel}>Vervaldatum</Text>
                    <Text style={stijlen.voorbeeldDatumWaarde}>{geselecteerdeFactuur.vervaldatum}</Text>
                  </View>
                </View>
                <View style={stijlen.voorbeeldScheidingslijn} />
                <Text style={stijlen.voorbeeldSectieLabel}>Factuur aan:</Text>
                <Text style={stijlen.voorbeeldKlantNaam}>{geselecteerdeFactuur.klantNaam}</Text>
                {geselecteerdeFactuur.klantAdres ? <Text style={stijlen.voorbeeldKlantInfo}>{geselecteerdeFactuur.klantAdres}</Text> : null}
                {geselecteerdeFactuur.klantEmail ? <Text style={stijlen.voorbeeldKlantInfo}>{geselecteerdeFactuur.klantEmail}</Text> : null}
                {geselecteerdeFactuur.klantKvk ? <Text style={stijlen.voorbeeldKlantInfo}>KvK: {geselecteerdeFactuur.klantKvk}</Text> : null}
                <View style={stijlen.voorbeeldScheidingslijn} />
                <View style={stijlen.voorbeeldRegelHeader}>
                  <Text style={[stijlen.voorbeeldRegelKop, { flex: 2 }]}>Omschrijving</Text>
                  <Text style={[stijlen.voorbeeldRegelKop, { width: 36, textAlign: 'center' }]}>Aant.</Text>
                  <Text style={[stijlen.voorbeeldRegelKop, { width: 65, textAlign: 'right' }]}>Prijs</Text>
                  <Text style={[stijlen.voorbeeldRegelKop, { width: 65, textAlign: 'right' }]}>Totaal</Text>
                </View>
                {geselecteerdeFactuur.regels?.map((regel: FactuurRegel) => (
                  <View key={regel.id} style={stijlen.voorbeeldRegel}>
                    <View style={{ flex: 2 }}>
                      <Text style={stijlen.voorbeeldRegelTekst}>{regel.omschrijving}</Text>
                      <Text style={stijlen.voorbeeldRegelBtw}>BTW {regel.btw} — per {regel.eenheid}</Text>
                    </View>
                    <Text style={[stijlen.voorbeeldRegelTekst, { width: 36, textAlign: 'center' }]}>{regel.aantal}</Text>
                    <Text style={[stijlen.voorbeeldRegelTekst, { width: 65, textAlign: 'right' }]}>
                      {euro(parseFloat(regel.prijs?.replace(',', '.') || '0'))}
                    </Text>
                    <Text style={[stijlen.voorbeeldRegelTekst, { width: 65, textAlign: 'right' }]}>
                      {geselecteerdeFactuur.soort === 'creditnota' ? '-' : ''}{euro(berekenRegelTotaal(regel))}
                    </Text>
                  </View>
                ))}
                <View style={stijlen.voorbeeldScheidingslijn} />
                <View style={stijlen.voorbeeldTotaalRij}>
                  <Text style={stijlen.voorbeeldTotaalLabel}>Subtotaal excl. BTW</Text>
                  <Text style={stijlen.voorbeeldTotaalBedrag}>
                    {geselecteerdeFactuur.soort === 'creditnota' ? '-' : ''}
                    {euro(geselecteerdeFactuur.regels?.reduce((s: number, r: FactuurRegel) => s + berekenRegelTotaal(r), 0) || 0)}
                  </Text>
                </View>
                <View style={stijlen.voorbeeldTotaalRij}>
                  <Text style={stijlen.voorbeeldTotaalLabel}>BTW</Text>
                  <Text style={stijlen.voorbeeldTotaalBedrag}>
                    {geselecteerdeFactuur.soort === 'creditnota' ? '-' : ''}
                    {euro(geselecteerdeFactuur.regels?.reduce((s: number, r: FactuurRegel) => s + berekenBtw(r), 0) || 0)}
                  </Text>
                </View>
                <View style={[stijlen.voorbeeldTotaalRij, stijlen.voorbeeldTotaalGrootRij]}>
                  <Text style={stijlen.voorbeeldTotaalLabelGroot}>
                    {geselecteerdeFactuur.soort === 'creditnota' ? 'TE CREDITEREN' : 'TOTAAL INCL. BTW'}
                  </Text>
                  <Text style={[stijlen.voorbeeldTotaalBedragGroot, geselecteerdeFactuur.soort === 'creditnota' && { color: '#f44336' }]}>
                    {geselecteerdeFactuur.soort === 'creditnota' ? '-' : ''}
                    {euro(geselecteerdeFactuur.regels?.reduce((s: number, r: FactuurRegel) =>
                      s + berekenRegelTotaal(r) + berekenBtw(r), 0) || 0)}
                  </Text>
                </View>
                {bedrijf.iban && geselecteerdeFactuur.soort !== 'creditnota' && (
                  <View style={stijlen.betalingBlok}>
                    <Text style={stijlen.betalingLabel}>BETALINGSINFORMATIE</Text>
                    <Text style={stijlen.betalingTekst}>IBAN: {bedrijf.iban}</Text>
                    {bedrijf.banknaam ? <Text style={stijlen.betalingTekst}>Bank: {bedrijf.banknaam}</Text> : null}
                    <Text style={stijlen.betalingTekst}>O.v.v. factuurnummer: {geselecteerdeFactuur.factuurNummer}</Text>
                  </View>
                )}
                {geselecteerdeFactuur.notities ? (
                  <View style={stijlen.notitiesBlok}>
                    <Text style={stijlen.notitiesLabel}>NOTITIES</Text>
                    <Text style={stijlen.notitiesTekst}>{geselecteerdeFactuur.notities}</Text>
                  </View>
                ) : null}
              </View>

              {/* STATUS - alleen voor normale facturen */}
              {geselecteerdeFactuur.soort !== 'creditnota' && (
                <View style={stijlen.actiesKaart}>
                  <Text style={stijlen.actiesTitel}>STATUS BIJWERKEN</Text>
                  <View style={stijlen.statusKnoppen}>
                    {(['concept', 'verzonden', 'betaald'] as const).map(s => (
                      <TouchableOpacity
                        key={s}
                        style={[stijlen.statusKnop, geselecteerdeFactuur.status === s && stijlen.statusKnopActief]}
                        onPress={() => statusBijwerken(geselecteerdeFactuur.id, s)}>
                        <Text style={[stijlen.statusKnopTekst, geselecteerdeFactuur.status === s && stijlen.statusKnopTekstActief]}>
                          {statusLabel(s)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* ACTIES */}
              <View style={stijlen.actiesKaart}>
                <Text style={stijlen.actiesTitel}>ACTIES</Text>
                <TouchableOpacity
                  style={[stijlen.actieKnop, stijlen.actieKnopPrimair]}
                  onPress={() => pdfDelenVanFactuur(geselecteerdeFactuur)}
                  disabled={pdfBezig}>
                  {pdfBezig ? <ActivityIndicator color="#ffffff" /> : (
                    <>
                      <Text style={stijlen.actieKnopIcoon}>📤</Text>
                      <View>
                        <Text style={stijlen.actieKnopTitel}>
                          {geselecteerdeFactuur.soort === 'creditnota' ? 'Creditnota delen' : 'Factuur delen'}
                        </Text>
                        <Text style={stijlen.actieKnopOndertitel}>WhatsApp, e-mail, SMS, Drive...</Text>
                      </View>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[stijlen.actieKnop, stijlen.actieKnopSecundair]}
                  onPress={() => pdfAfdrukken(geselecteerdeFactuur)}
                  disabled={pdfBezig}>
                  <Text style={stijlen.actieKnopIcoon}>🖨️</Text>
                  <View>
                    <Text style={[stijlen.actieKnopTitel, { color: '#C9A84C' }]}>Afdrukken</Text>
                    <Text style={stijlen.actieKnopOndertitel}>Naar printer sturen</Text>
                  </View>
                </TouchableOpacity>

                {/* Creditnota aanmaken knop - alleen voor normale facturen */}
                {geselecteerdeFactuur.soort !== 'creditnota' && (
                  <TouchableOpacity
                    style={[stijlen.actieKnop, stijlen.actieKnopCredit]}
                    onPress={() => nieuweCreditnota(geselecteerdeFactuur)}>
                    <Text style={stijlen.actieKnopIcoon}>↩</Text>
                    <View>
                      <Text style={[stijlen.actieKnopTitel, { color: '#f44336' }]}>Creditnota aanmaken</Text>
                      <Text style={stijlen.actieKnopOndertitel}>Factuur geheel of gedeeltelijk crediteren</Text>
                    </View>
                  </TouchableOpacity>
                )}

                {pakket === 'gratis' && (
                  <View style={stijlen.premiumOverlay}>
                    <Text style={stijlen.premiumOverlayTekst}>🔒 PDF delen vereist Premium</Text>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/abonnement')}>
                      <Text style={stijlen.premiumOverlayKnop}>Upgraden →</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* EXPORT MODAL */}
      <Modal visible={exportModalZichtbaar} animationType="slide" transparent>
        <View style={stijlen.exportOverlay}>
          <View style={stijlen.exportModal}>
            <Text style={stijlen.exportModalTitel}>📥 Facturen exporteren</Text>
            <Text style={stijlen.exportModalOndertitel}>Selecteer een periode</Text>

            <View style={stijlen.periodeKnoppen}>
              {(['deze-maand', 'vorige-maand', 'kwartaal', 'jaar'] as const).map(type => (
                <TouchableOpacity
                  key={type}
                  style={stijlen.periodeKnop}
                  onPress={() => snelPeriodeFacturen(type)}>
                  <Text style={stijlen.periodeKnopTekst}>
                    {type === 'deze-maand' ? 'Deze maand' : type === 'vorige-maand' ? 'Vorige maand' : type === 'kwartaal' ? 'Dit kwartaal' : 'Dit jaar'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ gap: 8, marginTop: 8 }}>
              <TextInput
                style={stijlen.datumInput}
                placeholder="Van (JJJJ-MM-DD)"
                placeholderTextColor="#555"
                value={vanDatum}
                onChangeText={setVanDatum}
              />
              <TextInput
                style={stijlen.datumInput}
                placeholder="Tot (JJJJ-MM-DD)"
                placeholderTextColor="#555"
                value={totDatum}
                onChangeText={setTotDatum}
              />
            </View>

            <TouchableOpacity
              style={stijlen.exportKnopGroot}
              onPress={() => { setExportModalZichtbaar(false); alleFacturenExporteren(); }}>
              <Text style={stijlen.exportKnopGrootTekst}>PDF genereren & delen</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ marginTop: 12, alignItems: 'center' }}
              onPress={() => setExportModalZichtbaar(false)}>
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
  terugTekst: { color: '#C9A84C', fontSize: 15, fontWeight: '600' },
  koptekstTitel: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  exportKnopTekst: { color: '#C9A84C', fontSize: 13, fontWeight: '700' },
  toevoegenKnop: { backgroundColor: '#FF6B00', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  toevoegenTekst: { color: '#1A1A1A', fontSize: 13, fontWeight: '800' },
  premiumBalk: { backgroundColor: '#1e1a0e', padding: 10, borderBottomWidth: 1, borderBottomColor: '#3a2e0a', alignItems: 'center' },
  premiumBalkTekst: { color: '#C9A84C', fontSize: 12, fontWeight: '600' },
  tabBar: { flexDirection: 'row', backgroundColor: '#1A1A1A', borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActief: { borderBottomColor: '#FF6B00' },
  tabTekst: { color: '#555', fontSize: 13, fontWeight: '600' },
  tabTekstActief: { color: '#FF6B00', fontWeight: '800' },
  scrollInhoud: { padding: 16, paddingBottom: 40 },
  legeKaart: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  leegIcoon: { fontSize: 48 },
  leegeTekst: { color: '#666', fontSize: 16, fontWeight: '600' },
  leegeOndertekst: { color: '#444', fontSize: 13, textAlign: 'center', paddingHorizontal: 40 },
  upgradeKnop: { backgroundColor: '#FF6B00', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10, marginTop: 4 },
  upgradeKnopTekst: { color: '#1A1A1A', fontSize: 13, fontWeight: '800' },
  creditnotaTip: { backgroundColor: '#1a1a0a', borderRadius: 10, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: '#C9A84C33' },
  creditnotaTipTekst: { color: '#C9A84C', fontSize: 12, textAlign: 'center' },
  factuurKaart: { backgroundColor: '#242424', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2a2a2a' },
  creditKaart: { borderColor: '#f4433633' },
  factuurKoptekst: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  factuurNummer: { color: '#C9A84C', fontSize: 15, fontWeight: '800' },
  factuurKlant: { color: '#ffffff', fontSize: 14, marginTop: 2 },
  factuurRechts: { alignItems: 'flex-end', gap: 6 },
  factuurTotaal: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  statusTekst: { fontSize: 11, fontWeight: '700' },
  factuurMeta: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  factuurMetaTekst: { color: '#555', fontSize: 11 },
  snelDelenKnop: { marginLeft: 'auto', backgroundColor: '#1a1a2e', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#003DA5' },
  snelDelenTekst: { color: '#003DA5', fontSize: 11, fontWeight: '700' },
  // Debiteuren
  debiteurenSamenvatting: { flexDirection: 'row', backgroundColor: '#242424', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#2a2a2a' },
  samenvattingItem: { flex: 1, alignItems: 'center' },
  samenvattingLabel: { color: '#666', fontSize: 11, marginBottom: 4 },
  samenvattingBedrag: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
  debiteurKaart: { backgroundColor: '#242424', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2a2a2a', gap: 12 },
  debiteurKoptekst: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  debiteurAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#003DA5', alignItems: 'center', justifyContent: 'center' },
  debiteurAvatarTekst: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  debiteurNaam: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  debiteurAantal: { color: '#555', fontSize: 11, marginTop: 2 },
  openstaandBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  openstaandTekst: { fontSize: 11, fontWeight: '700' },
  debiteurRijen: { backgroundColor: '#1A1A1A', borderRadius: 10, padding: 12, gap: 8 },
  debiteurRij: { flexDirection: 'row', justifyContent: 'space-between' },
  debiteurRijGroot: { paddingTop: 8, borderTopWidth: 1, borderTopColor: '#2a2a2a', marginTop: 4 },
  debiteurRijLabel: { color: '#666', fontSize: 13 },
  debiteurRijBedrag: { color: '#aaa', fontSize: 13, fontWeight: '600' },
  debiteurRijLabelGroot: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  debiteurRijBedragGroot: { fontSize: 16, fontWeight: '900' },
  debiteurFactuurregel: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#2a2a2a', gap: 8 },
  debiteurFactuurNummer: { color: '#C9A84C', fontSize: 12, fontWeight: '700', flex: 1 },
  debiteurFactuurDatum: { color: '#555', fontSize: 11 },
  debiteurFactuurBedrag: { fontSize: 13, fontWeight: '700' },
  miniStatusBadge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
  miniStatusTekst: { fontSize: 11, fontWeight: '700' },
  // Credit banner
  creditBanner: { backgroundColor: '#1a0a0a', borderBottomWidth: 1, borderBottomColor: '#f4433633', padding: 10, alignItems: 'center' },
  creditBannerTekst: { color: '#f44336', fontSize: 12, fontWeight: '700' },
  creditBannerVoorbeeld: { backgroundColor: '#1a0a0a', borderRadius: 8, padding: 10, marginBottom: 8 },
  creditBannerVoorbeeldTekst: { color: '#f44336', fontSize: 12, fontWeight: '600' },
  // Modal
  modalScherm: { flex: 1, backgroundColor: '#1A1A1A' },
  modalKoptekst: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  annulerenTekst: { color: '#888', fontSize: 15, fontWeight: '600', width: 80 },
  modalTitel: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  opslaanTekst: { color: '#FF6B00', fontSize: 15, fontWeight: '700', width: 80, textAlign: 'right' },
  modalInhoud: { padding: 20, paddingBottom: 60 },
  sectieKader: { backgroundColor: '#242424', borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#2a2a2a', gap: 14 },
  sectieKoptekst: { color: '#C9A84C', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
  sectieKoptekstRij: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selecteerKnop: { backgroundColor: '#003DA5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  selecteerKnopTekst: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  geselecteerdKaart: { backgroundColor: '#1a1a2e', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#003DA5', gap: 4 },
  geselecteerdNaam: { color: '#ffffff', fontSize: 14, fontWeight: '700', marginBottom: 2 },
  geselecteerdInfo: { color: '#888', fontSize: 12 },
  wissenTekst: { color: '#f44336', fontSize: 12, marginTop: 6 },
  tweeKolommen: { flexDirection: 'row', gap: 12 },
  invoerGroep: { gap: 6 },
  label: { color: '#888', fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },
  verplicht: { color: '#FF6B00' },
  invoer: { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333', borderRadius: 12, padding: 14, color: '#ffffff', fontSize: 15 },
  bedragRij: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333', borderRadius: 12 },
  euroTekst: { color: '#C9A84C', fontSize: 18, fontWeight: '700', paddingLeft: 14 },
  bedragInvoer: { flex: 1, padding: 14, color: '#ffffff', fontSize: 15 },
  btwOpties: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  btwOptie: { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  btwOptieActief: { backgroundColor: '#003DA5', borderColor: '#003DA5' },
  btwOptieTekst: { color: '#555', fontSize: 13, fontWeight: '600' },
  btwOptieTekstActief: { color: '#ffffff', fontWeight: '700' },
  regelKaart: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#333', gap: 10 },
  regelKoptekst: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  regelNummer: { color: '#C9A84C', fontSize: 12, fontWeight: '700' },
  regelActies: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  productSelecteerKnop: { backgroundColor: '#1e1a0e', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#3a2e0a' },
  productSelecteerTekst: { color: '#C9A84C', fontSize: 11, fontWeight: '700' },
  regelVerwijderen: { color: '#f44336', fontSize: 16, fontWeight: '700' },
  regelTotaalRij: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#2a2a2a' },
  regelTotaalLabel: { color: '#666', fontSize: 12 },
  regelTotaalBedrag: { color: '#C9A84C', fontSize: 13, fontWeight: '700' },
  regelToevoegenKnop: { borderWidth: 1, borderColor: '#333', borderRadius: 10, padding: 12, alignItems: 'center', borderStyle: 'dashed' },
  regelToevoegenTekst: { color: '#555', fontSize: 14, fontWeight: '600' },
  totaalKaart: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#003DA5', gap: 8 },
  totaalTitel: { color: '#003DA5', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 4 },
  totaalRij: { flexDirection: 'row', justifyContent: 'space-between' },
  totaalLabel: { color: '#888', fontSize: 13 },
  totaalBedrag: { color: '#888', fontSize: 13 },
  totaalScheidingslijn: { height: 1, backgroundColor: '#003DA5', opacity: 0.3, marginVertical: 4 },
  totaalLabelGroot: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
  totaalBedragGroot: { color: '#C9A84C', fontSize: 17, fontWeight: '900' },
  selectieKaart: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#242424', borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#2a2a2a', gap: 12 },
  klantAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#003DA5', alignItems: 'center', justifyContent: 'center' },
  klantAvatarTekst: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  selectieInfo: { flex: 1, gap: 3 },
  selectieNaam: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  selectieDetail: { color: '#666', fontSize: 12 },
  selectiePijl: { color: '#444', fontSize: 20 },
  voorbeeldInhoud: { padding: 16, paddingBottom: 60 },
  voorbeeldKaart: { backgroundColor: '#242424', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#2a2a2a' },
  voorbeeldHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  voorbeeldBedrijfsnaam: { color: '#ffffff', fontSize: 16, fontWeight: '800', marginBottom: 4 },
  voorbeeldBedrijfInfo: { color: '#666', fontSize: 12, lineHeight: 18 },
  factuurNummerBlok: { alignItems: 'flex-end' },
  factuurNummerLabel: { color: '#C9A84C', fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  factuurNummerWaarde: { color: '#ffffff', fontSize: 18, fontWeight: '900' },
  voorbeeldScheidingslijn: { height: 1, backgroundColor: '#333', marginVertical: 14 },
  voorbeeldDatumRij: { flexDirection: 'row', justifyContent: 'space-between' },
  voorbeeldDatumLabel: { color: '#666', fontSize: 11, marginBottom: 2 },
  voorbeeldDatumWaarde: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
  voorbeeldSectieLabel: { color: '#666', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  voorbeeldKlantNaam: { color: '#ffffff', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  voorbeeldKlantInfo: { color: '#888', fontSize: 13, lineHeight: 20 },
  voorbeeldRegelHeader: { flexDirection: 'row', marginBottom: 8 },
  voorbeeldRegelKop: { color: '#666', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  voorbeeldRegel: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#2a2a2a', alignItems: 'flex-start' },
  voorbeeldRegelTekst: { color: '#ffffff', fontSize: 13 },
  voorbeeldRegelBtw: { color: '#555', fontSize: 11, marginTop: 2 },
  voorbeeldTotaalRij: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  voorbeeldTotaalGrootRij: { backgroundColor: '#1a1a2e', borderRadius: 8, padding: 10, marginTop: 4 },
  voorbeeldTotaalLabel: { color: '#888', fontSize: 13 },
  voorbeeldTotaalBedrag: { color: '#888', fontSize: 13 },
  voorbeeldTotaalLabelGroot: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
  voorbeeldTotaalBedragGroot: { color: '#C9A84C', fontSize: 16, fontWeight: '900' },
  betalingBlok: { backgroundColor: '#1e1a0e', borderRadius: 10, padding: 14, marginTop: 12, borderWidth: 1, borderColor: '#3a2e0a', gap: 4 },
  betalingLabel: { color: '#C9A84C', fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  betalingTekst: { color: '#888', fontSize: 13, lineHeight: 20 },
  notitiesBlok: { backgroundColor: '#1A1A1A', borderRadius: 10, padding: 12, marginTop: 8 },
  notitiesLabel: { color: '#666', fontSize: 11, fontWeight: '700', marginBottom: 4 },
  notitiesTekst: { color: '#888', fontSize: 13, lineHeight: 20 },
  actiesKaart: { backgroundColor: '#242424', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2a2a2a', gap: 10 },
  actiesTitel: { color: '#888', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  statusKnoppen: { flexDirection: 'row', gap: 8 },
  statusKnop: { flex: 1, backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333', borderRadius: 10, padding: 10, alignItems: 'center' },
  statusKnopActief: { backgroundColor: '#003DA5', borderColor: '#003DA5' },
  statusKnopTekst: { color: '#555', fontSize: 11, fontWeight: '600' },
  statusKnopTekstActief: { color: '#ffffff', fontWeight: '700' },
  actieKnop: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 14, borderWidth: 1 },
  actieKnopPrimair: { backgroundColor: '#003DA5', borderColor: '#003DA5' },
  actieKnopSecundair: { backgroundColor: '#1e1a0e', borderColor: '#3a2e0a' },
  actieKnopCredit: { backgroundColor: '#1a0a0a', borderColor: '#f4433633' },
  actieKnopIcoon: { fontSize: 28 },
  actieKnopTitel: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  actieKnopOndertitel: { color: '#aaa', fontSize: 12, marginTop: 2 },
  premiumOverlay: { backgroundColor: '#1e1a0e', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#3a2e0a', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  premiumOverlayTekst: { color: '#C9A84C', fontSize: 13, fontWeight: '600' },
  premiumOverlayKnop: { color: '#FF6B00', fontSize: 13, fontWeight: '800' },
  exportOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  exportModal: { backgroundColor: '#1A1A1A', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40, borderTopWidth: 1, borderColor: '#2a2a2a' },
  exportModalTitel: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  exportModalOndertitel: { color: '#666', fontSize: 13, marginBottom: 16 },
  periodeKnoppen: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  periodeKnop: { backgroundColor: '#242424', borderWidth: 1, borderColor: '#333', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  periodeKnopTekst: { color: '#C9A84C', fontSize: 13, fontWeight: '600' },
  datumInput: { backgroundColor: '#242424', borderWidth: 1, borderColor: '#333', borderRadius: 10, padding: 12, color: '#fff', fontSize: 14 },
  exportKnopGroot: { backgroundColor: '#C9A84C', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16 },
  exportKnopGrootTekst: { color: '#1A1A1A', fontSize: 15, fontWeight: '800' },
});