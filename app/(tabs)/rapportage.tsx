import * as Print from 'expo-print';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ScreenCapture from 'expo-screen-capture';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert,
  ScrollView,
  StatusBar,
  StyleSheet, Text,
  TouchableOpacity,
  View
} from 'react-native';
import { gebruikBedrijf, gebruikPakket, gebruikTransacties } from '../../hooks/gebruikData';

type PeriodeSoort = 'jaar' | 'kwartaal' | 'maand';

const MAANDEN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
const KWARTALEN = ['Q1 (Jan-Mar)', 'Q2 (Apr-Jun)', 'Q3 (Jul-Sep)', 'Q4 (Okt-Dec)'];

const CATEGORIE_ICONEN: Record<string, string> = {
  'Omzet diensten': '🛠️', 'Omzet producten': '📦', 'Overige inkomsten': '💰',
  'Huisvestingskosten': '🏠', 'Vervoerskosten': '🚗', 'Personeelskosten': '👥',
  'Marketingkosten': '📣', 'Kantoorkosten': '🖥️', 'Financiële kosten': '🏦',
  'Professionele diensten': '📊', 'Inkoop': '🛒', 'Overige kosten': '📎',
  'Huur': '🏠', 'Gas, Water & Elektriciteit': '💡', 'Verzekeringen': '🛡️',
  'Brandstof': '⛽', 'Software & Licenties': '💻', 'Accountant & Boekhouder': '📋',
};

function rapportHtml(
  periodeLabel: string,
  bedrijf: any,
  totaalInkomsten: number,
  totaalUitgaven: number,
  netto: number,
  btw21Inkomsten: number,
  btw9Inkomsten: number,
  btw21Uitgaven: number,
  btw9Uitgaven: number,
  btwSaldo: number,
  inkomstenPerCategorie: Record<string, { totaal: number; items: any[] }>,
  uitgavenPerCategorie: Record<string, { totaal: number; items: any[] }>,
  transacties: any[]
): string {
  const euro = (b: number) => `€ ${b.toFixed(2).replace('.', ',')}`;
  const datum = new Date().toLocaleDateString('nl-NL');

  const inkomstenRijen = Object.entries(inkomstenPerCategorie).map(([cat, data]) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">${cat}</td>
      <td style="padding: 8px; border-bottom: 1px solid #f0f0f0; text-align: center;">${data.items.length}</td>
      <td style="padding: 8px; border-bottom: 1px solid #f0f0f0; text-align: right; color: #4CAF50; font-weight: 600;">${euro(data.totaal)}</td>
    </tr>
  `).join('');

  const uitgavenRijen = Object.entries(uitgavenPerCategorie).map(([cat, data]) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">${cat}</td>
      <td style="padding: 8px; border-bottom: 1px solid #f0f0f0; text-align: center;">${data.items.length}</td>
      <td style="padding: 8px; border-bottom: 1px solid #f0f0f0; text-align: right; color: #f44336; font-weight: 600;">${euro(data.totaal)}</td>
    </tr>
  `).join('');

  const transactieRijen = [...transacties]
    .sort((a, b) => b.aangemaaktOp?.localeCompare(a.aangemaaktOp))
    .map(t => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #f0f0f0; font-size: 11px;">${t.datum}</td>
        <td style="padding: 8px; border-bottom: 1px solid #f0f0f0; font-size: 11px;">${t.omschrijving}</td>
        <td style="padding: 8px; border-bottom: 1px solid #f0f0f0; font-size: 11px;">${t.categorie || '-'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #f0f0f0; font-size: 11px;">${t.btwTarief}</td>
        <td style="padding: 8px; border-bottom: 1px solid #f0f0f0; text-align: right; font-size: 11px; color: ${t.soort === 'inkomst' ? '#4CAF50' : '#f44336'}; font-weight: 600;">
          ${t.soort === 'inkomst' ? '+' : '-'}${euro(parseFloat(t.bedrag))}
        </td>
      </tr>
    `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; font-size: 13px; }
        .pagina { max-width: 794px; margin: 0 auto; padding: 48px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
        .bedrijf-naam { font-size: 20px; font-weight: 800; margin-bottom: 4px; }
        .bedrijf-info { color: #888; font-size: 12px; line-height: 1.8; }
        .rapport-blok { text-align: right; }
        .rapport-label { font-size: 10px; font-weight: 800; letter-spacing: 2px; color: #C9A84C; margin-bottom: 4px; }
        .rapport-titel { font-size: 20px; font-weight: 900; color: #1a1a1a; }
        .rapport-periode { color: #888; font-size: 13px; margin-top: 4px; }
        .scheidingslijn { border: none; border-top: 2px solid #C9A84C; margin: 24px 0; }
        .sectie { margin-bottom: 32px; }
        .sectie-titel { font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: #888; margin-bottom: 12px; border-bottom: 1px solid #f0f0f0; padding-bottom: 6px; }
        .btw-subtitel { font-size: 10px; font-weight: 700; letter-spacing: 1px; color: #aaa; margin: 10px 0 6px 0; }
        .overzicht-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .overzicht-kaart { background: #f8f8f8; border-radius: 10px; padding: 16px; text-align: center; }
        .overzicht-label { font-size: 11px; color: #888; margin-bottom: 6px; }
        .overzicht-bedrag { font-size: 18px; font-weight: 900; }
        .groen { color: #4CAF50; }
        .rood { color: #f44336; }
        .goud { color: #C9A84C; }
        .btw-kaart { background: #fff8e8; border: 1px solid #C9A84C; border-radius: 10px; padding: 16px; margin-bottom: 16px; }
        .btw-rij { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
        .btw-scheidingslijn { border: none; border-top: 1px solid #e0c870; margin: 10px 0; }
        .btw-saldo { display: flex; justify-content: space-between; padding: 10px 14px; border-radius: 8px; margin-top: 10px; font-weight: 800; font-size: 14px; }
        .btw-saldo-betalen { background: #fff0e0; }
        .btw-saldo-terug { background: #e8f5e9; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        thead { background: #1a1a1a; }
        thead th { padding: 10px 8px; color: #fff; font-size: 11px; font-weight: 700; text-align: left; }
        thead th:last-child { text-align: right; }
        .winstmarge { background: #e8f5e9; border-radius: 8px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; margin-top: 12px; }
        .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #f0f0f0; display: flex; justify-content: space-between; color: #aaa; font-size: 11px; }
      </style>
    </head>
    <body>
      <div class="pagina">
        <div class="header">
          <div>
            <div class="bedrijf-naam">${bedrijf.bedrijfsnaam || 'Bedrijfsnaam'}</div>
            <div class="bedrijf-info">
              ${bedrijf.kvkNummer ? 'KvK: ' + bedrijf.kvkNummer + '<br>' : ''}
              ${bedrijf.btwNummer ? 'BTW: ' + bedrijf.btwNummer + '<br>' : ''}
              ${bedrijf.email || ''}
            </div>
          </div>
          <div class="rapport-blok">
            <div class="rapport-label">FINANCIEEL RAPPORT</div>
            <div class="rapport-titel">${periodeLabel}</div>
            <div class="rapport-periode">Aangemaakt op ${datum}</div>
          </div>
        </div>
        <hr class="scheidingslijn">
        <div class="sectie">
          <div class="sectie-titel">FINANCIEEL OVERZICHT</div>
          <div class="overzicht-grid">
            <div class="overzicht-kaart">
              <div class="overzicht-label">Totaal inkomsten</div>
              <div class="overzicht-bedrag groen">${euro(totaalInkomsten)}</div>
            </div>
            <div class="overzicht-kaart">
              <div class="overzicht-label">Totaal uitgaven</div>
              <div class="overzicht-bedrag rood">${euro(totaalUitgaven)}</div>
            </div>
            <div class="overzicht-kaart">
              <div class="overzicht-label">Netto resultaat</div>
              <div class="overzicht-bedrag ${netto >= 0 ? 'groen' : 'rood'}">${euro(netto)}</div>
            </div>
          </div>
          ${totaalInkomsten > 0 ? `
          <div class="winstmarge">
            <span style="color: #555;">Winstmarge</span>
            <span style="color: #4CAF50; font-weight: 800; font-size: 16px;">${((netto / totaalInkomsten) * 100).toFixed(1)}%</span>
          </div>` : ''}
        </div>
        <div class="sectie">
          <div class="sectie-titel">BTW OVERZICHT</div>
          <div class="btw-kaart">
            <div class="btw-subtitel">AF TE DRAGEN (over verkopen)</div>
            <div class="btw-rij"><span>BTW 21% over inkomsten</span><span style="color: #FF6B00; font-weight: 600;">${euro(btw21Inkomsten)}</span></div>
            <div class="btw-rij"><span>BTW 9% over inkomsten</span><span style="color: #FF6B00; font-weight: 600;">${euro(btw9Inkomsten)}</span></div>
            <hr class="btw-scheidingslijn">
            <div class="btw-subtitel">TERUG TE ONTVANGEN (over inkopen)</div>
            <div class="btw-rij"><span>BTW 21% over uitgaven</span><span style="color: #4CAF50; font-weight: 600;">${euro(btw21Uitgaven)}</span></div>
            <div class="btw-rij"><span>BTW 9% over uitgaven</span><span style="color: #4CAF50; font-weight: 600;">${euro(btw9Uitgaven)}</span></div>
            <div class="btw-saldo ${btwSaldo >= 0 ? 'btw-saldo-betalen' : 'btw-saldo-terug'}">
              <span>${btwSaldo >= 0 ? '⚠️ Te betalen aan Belastingdienst' : '✅ Terug te ontvangen'}</span>
              <span style="color: ${btwSaldo >= 0 ? '#FF6B00' : '#4CAF50'};">${euro(Math.abs(btwSaldo))}</span>
            </div>
          </div>
        </div>
        ${Object.keys(inkomstenPerCategorie).length > 0 ? `
        <div class="sectie">
          <div class="sectie-titel">INKOMSTEN PER CATEGORIE</div>
          <table>
            <thead><tr><th>Categorie</th><th style="text-align: center;">Transacties</th><th style="text-align: right;">Bedrag</th></tr></thead>
            <tbody>${inkomstenRijen}</tbody>
          </table>
        </div>` : ''}
        ${Object.keys(uitgavenPerCategorie).length > 0 ? `
        <div class="sectie">
          <div class="sectie-titel">UITGAVEN PER CATEGORIE</div>
          <table>
            <thead><tr><th>Categorie</th><th style="text-align: center;">Transacties</th><th style="text-align: right;">Bedrag</th></tr></thead>
            <tbody>${uitgavenRijen}</tbody>
          </table>
        </div>` : ''}
        ${transacties.length > 0 ? `
        <div class="sectie">
          <div class="sectie-titel">ALLE TRANSACTIES (${transacties.length})</div>
          <table>
            <thead><tr><th>Datum</th><th>Omschrijving</th><th>Categorie</th><th>BTW</th><th style="text-align: right;">Bedrag</th></tr></thead>
            <tbody>${transactieRijen}</tbody>
          </table>
        </div>` : ''}
        <div class="footer">
          <span>${bedrijf.bedrijfsnaam || ''} — ${bedrijf.email || ''}</span>
          <span>Gemaakt met ZZPBox</span>
        </div>
      </div>
    </body>
    </html>
  `;
}

export default function RapportageScherm() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const pakket = gebruikPakket();
  const { transacties, laden } = gebruikTransacties();
  const { bedrijf } = gebruikBedrijf();

  const nu = new Date();
  const [periodeType, setPeriodeType] = useState<PeriodeSoort>('jaar');
  const [geselecteerdKwartaal, setGeselecteerdKwartaal] = useState(Math.floor(nu.getMonth() / 3));
  const [geselecteerdeMaand, setGeselecteerdeMaand] = useState(nu.getMonth());
  const [tabActief, setTabActief] = useState<'overzicht' | 'inkomsten' | 'uitgaven'>('overzicht');
  const [pdfBezig, setPdfBezig] = useState(false);
  const jaar = nu.getFullYear();

  useEffect(() => {
    if (pakket === 'gratis') {
      ScreenCapture.preventScreenCaptureAsync();
    } else {
      ScreenCapture.allowScreenCaptureAsync();
    }
    return () => { ScreenCapture.allowScreenCaptureAsync(); };
  }, [pakket]);

  function filterTransacties() {
    return transacties.filter(t => {
      if (!t.aangemaaktOp) return false;
      const datum = new Date(t.aangemaaktOp);
      if (periodeType === 'jaar') return datum.getFullYear() === jaar;
      if (periodeType === 'kwartaal') {
        const maanden = [[0,1,2],[3,4,5],[6,7,8],[9,10,11]][geselecteerdKwartaal];
        return datum.getFullYear() === jaar && maanden.includes(datum.getMonth());
      }
      return datum.getFullYear() === jaar && datum.getMonth() === geselecteerdeMaand;
    });
  }

  const gefilterd = filterTransacties();
  const inkomsten = gefilterd.filter(t => t.soort === 'inkomst');
  const uitgaven = gefilterd.filter(t => t.soort === 'uitgave');

  const totaalInkomsten = inkomsten.reduce((s, t) => s + parseFloat(t.bedrag || '0'), 0);
  const totaalUitgaven = uitgaven.reduce((s, t) => s + parseFloat(t.bedrag || '0'), 0);
  const netto = totaalInkomsten - totaalUitgaven;

  const btw21Inkomsten = inkomsten.filter(t => t.btwTarief === '21%').reduce((s, t) => s + parseFloat(t.btwBedrag || '0'), 0);
  const btw9Inkomsten = inkomsten.filter(t => t.btwTarief === '9%').reduce((s, t) => s + parseFloat(t.btwBedrag || '0'), 0);
  const btw21Uitgaven = uitgaven.filter(t => t.btwTarief === '21%').reduce((s, t) => s + parseFloat(t.btwBedrag || '0'), 0);
  const btw9Uitgaven = uitgaven.filter(t => t.btwTarief === '9%').reduce((s, t) => s + parseFloat(t.btwBedrag || '0'), 0);
  const totaalBtwAfdragen = btw21Inkomsten + btw9Inkomsten;
  const totaalBtwTerug = btw21Uitgaven + btw9Uitgaven;
  const btwSaldo = totaalBtwAfdragen - totaalBtwTerug;

  function groepeerOpCategorie(lijst: any[]): Record<string, { totaal: number; items: any[] }> {
    const groepen: Record<string, { totaal: number; items: any[] }> = {};
    lijst.forEach(t => {
      const cat = t.categorie || 'Overig';
      if (!groepen[cat]) groepen[cat] = { totaal: 0, items: [] };
      groepen[cat].totaal += parseFloat(t.bedrag || '0');
      groepen[cat].items.push(t);
    });
    return Object.fromEntries(Object.entries(groepen).sort((a, b) => b[1].totaal - a[1].totaal));
  }

  const inkomstenPerCategorie = groepeerOpCategorie(inkomsten);
  const uitgavenPerCategorie = groepeerOpCategorie(uitgaven);

  function euro(b: number) { return `€ ${b.toFixed(2).replace('.', ',')}`; }

  function periodeLabel() {
    if (periodeType === 'jaar') return `Jaar ${jaar}`;
    if (periodeType === 'kwartaal') return `${KWARTALEN[geselecteerdKwartaal].split(' ')[0]} ${jaar}`;
    return `${MAANDEN[geselecteerdeMaand]} ${jaar}`;
  }

  function procentBalk(deel: number, totaal: number): number {
    if (totaal === 0) return 0;
    return Math.min((deel / totaal) * 100, 100);
  }

  function navigeerTerug() {
    if (from === 'dashboard') {
      router.push('/(tabs)/dashboard');
    } else {
      router.push('/(tabs)/instellingen');
    }
  }

  async function rapportPdfDelen() {
    if (pakket === 'gratis') {
      Alert.alert('Premium functie', 'PDF exporteren is alleen beschikbaar in Premium.', [
        { text: 'Annuleren', style: 'cancel' },
        { text: 'Upgraden', onPress: () => router.push('/(tabs)/abonnement') }
      ]);
      return;
    }
    setPdfBezig(true);
    try {
      const html = rapportHtml(periodeLabel(), bedrijf, totaalInkomsten, totaalUitgaven, netto, btw21Inkomsten, btw9Inkomsten, btw21Uitgaven, btw9Uitgaven, btwSaldo, inkomstenPerCategorie, uitgavenPerCategorie, gefilterd);
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      const deelbaar = await Sharing.isAvailableAsync();
      if (deelbaar) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: `Rapport ${periodeLabel()} delen`, UTI: 'com.adobe.pdf' });
      } else {
        Alert.alert('Niet beschikbaar', 'Delen is niet beschikbaar op dit apparaat.');
      }
    } catch (e) {
      Alert.alert('Fout', 'Kon PDF niet aanmaken. Probeer opnieuw.');
    } finally {
      setPdfBezig(false);
    }
  }

  async function rapportAfdrukken() {
    if (pakket === 'gratis') {
      Alert.alert('Premium functie', 'Afdrukken is alleen beschikbaar in Premium.', [
        { text: 'Annuleren', style: 'cancel' },
        { text: 'Upgraden', onPress: () => router.push('/(tabs)/abonnement') }
      ]);
      return;
    }
    setPdfBezig(true);
    try {
      const html = rapportHtml(periodeLabel(), bedrijf, totaalInkomsten, totaalUitgaven, netto, btw21Inkomsten, btw9Inkomsten, btw21Uitgaven, btw9Uitgaven, btwSaldo, inkomstenPerCategorie, uitgavenPerCategorie, gefilterd);
      await Print.printAsync({ html });
    } catch (e) {
      Alert.alert('Fout', 'Kon rapport niet afdrukken.');
    } finally {
      setPdfBezig(false);
    }
  }

  return (
    <View style={stijlen.scherm}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />

      <View style={stijlen.koptekst}>
        <TouchableOpacity onPress={navigeerTerug}>
          <Text style={stijlen.terugTekst}>← Terug</Text>
        </TouchableOpacity>
        <Text style={stijlen.koptekstTitel}>Rapportage</Text>
        {pakket === 'premium' ? (
          <TouchableOpacity onPress={rapportPdfDelen} disabled={pdfBezig}>
            {pdfBezig ? <ActivityIndicator color="#C9A84C" /> : <Text style={stijlen.pdfKnopTekst}>📤 PDF</Text>}
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      <View style={stijlen.periodeContainer}>
        <View style={stijlen.periodeKnoppen}>
          {(['jaar', 'kwartaal', 'maand'] as PeriodeSoort[]).map(p => (
            <TouchableOpacity key={p} style={[stijlen.periodeKnop, periodeType === p && stijlen.periodeKnopActief]} onPress={() => setPeriodeType(p)}>
              <Text style={[stijlen.periodeKnopTekst, periodeType === p && stijlen.periodeKnopTekstActief]}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {periodeType === 'kwartaal' && (
          <View style={stijlen.subSelectie}>
            {KWARTALEN.map((k, i) => (
              <TouchableOpacity key={i} style={[stijlen.subOptie, geselecteerdKwartaal === i && stijlen.subOptieActief]} onPress={() => setGeselecteerdKwartaal(i)}>
                <Text style={[stijlen.subOptieTekst, geselecteerdKwartaal === i && stijlen.subOptieTekstActief]}>{k.split(' ')[0]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {periodeType === 'maand' && (
          <View style={stijlen.subSelectie}>
            {MAANDEN.map((m, i) => (
              <TouchableOpacity key={i} style={[stijlen.subOptie, geselecteerdeMaand === i && stijlen.subOptieActief]} onPress={() => setGeselecteerdeMaand(i)}>
                <Text style={[stijlen.subOptieTekst, geselecteerdeMaand === i && stijlen.subOptieTekstActief]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <Text style={stijlen.periodeLabel}>{periodeLabel()}</Text>
      </View>

      <View style={stijlen.tabBar}>
        {(['overzicht', 'inkomsten', 'uitgaven'] as const).map(tab => (
          <TouchableOpacity key={tab} style={[stijlen.tab, tabActief === tab && stijlen.tabActief]} onPress={() => setTabActief(tab)}>
            <Text style={[stijlen.tabTekst, tabActief === tab && stijlen.tabTekstActief]}>
              {tab === 'overzicht' ? '📊 Overzicht' : tab === 'inkomsten' ? '💰 Inkomsten' : '🧾 Uitgaven'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={stijlen.scrollInhoud}>
        {laden ? (
          <ActivityIndicator color="#C9A84C" style={{ marginTop: 40 }} />
        ) : (
          <>
            {tabActief === 'overzicht' && (
              <>
                <View style={stijlen.kaart}>
                  <Text style={stijlen.kaartTitel}>FINANCIEEL OVERZICHT</Text>
                  <View style={stijlen.rij}><Text style={stijlen.rijLabel}>Totaal inkomsten</Text><Text style={stijlen.bedragGroen}>{euro(totaalInkomsten)}</Text></View>
                  <View style={stijlen.rij}><Text style={stijlen.rijLabel}>Totaal uitgaven</Text><Text style={stijlen.bedragRood}>{euro(totaalUitgaven)}</Text></View>
                  <View style={stijlen.scheidingslijn} />
                  <View style={stijlen.rij}>
                    <Text style={stijlen.rijLabelGroot}>Netto resultaat</Text>
                    <Text style={[stijlen.bedragGroot, { color: netto >= 0 ? '#4CAF50' : '#f44336' }]}>{euro(netto)}</Text>
                  </View>
                  {totaalInkomsten > 0 && (
                    <View style={stijlen.winstMarge}>
                      <Text style={stijlen.winstMargeTekst}>Winstmarge: {((netto / totaalInkomsten) * 100).toFixed(1)}%</Text>
                    </View>
                  )}
                </View>

                <View style={[stijlen.kaart, { borderColor: '#3a2e0a' }]}>
                  <Text style={stijlen.kaartTitel}>BTW OVERZICHT</Text>
                  <Text style={stijlen.btwSectieLabel}>AF TE DRAGEN (over verkopen)</Text>
                  <View style={stijlen.rij}><Text style={stijlen.rijLabel}>BTW 21% over inkomsten</Text><Text style={stijlen.bedragOranje}>{euro(btw21Inkomsten)}</Text></View>
                  <View style={stijlen.rij}><Text style={stijlen.rijLabel}>BTW 9% over inkomsten</Text><Text style={stijlen.bedragOranje}>{euro(btw9Inkomsten)}</Text></View>
                  <View style={stijlen.scheidingslijn} />
                  <Text style={stijlen.btwSectieLabel}>TERUG TE ONTVANGEN (over inkopen)</Text>
                  <View style={stijlen.rij}><Text style={stijlen.rijLabel}>BTW 21% over uitgaven</Text><Text style={stijlen.bedragGroen}>{euro(btw21Uitgaven)}</Text></View>
                  <View style={stijlen.rij}><Text style={stijlen.rijLabel}>BTW 9% over uitgaven</Text><Text style={stijlen.bedragGroen}>{euro(btw9Uitgaven)}</Text></View>
                  <View style={stijlen.scheidingslijn} />
                  <View style={stijlen.rij}>
                    <Text style={stijlen.rijLabelGroot}>{btwSaldo >= 0 ? 'Te betalen aan Belastingdienst' : 'Terug te ontvangen'}</Text>
                    <Text style={[stijlen.bedragGroot, { color: btwSaldo >= 0 ? '#FF6B00' : '#4CAF50' }]}>{euro(Math.abs(btwSaldo))}</Text>
                  </View>
                  <View style={[stijlen.winstMarge, { backgroundColor: btwSaldo >= 0 ? '#2e1a0e' : '#1a2e1a' }]}>
                    <Text style={[stijlen.winstMargeTekst, { color: btwSaldo >= 0 ? '#FF6B00' : '#4CAF50' }]}>
                      {btwSaldo >= 0 ? '⚠️ Te betalen' : '✅ Terug te ontvangen'}: {euro(Math.abs(btwSaldo))}
                    </Text>
                  </View>
                </View>

                <View style={stijlen.kaart}>
                  <Text style={stijlen.kaartTitel}>STATISTIEKEN</Text>
                  <View style={stijlen.rij}><Text style={stijlen.rijLabel}>Aantal transacties</Text><Text style={stijlen.statWaarde}>{gefilterd.length}</Text></View>
                  <View style={stijlen.rij}><Text style={stijlen.rijLabel}>Gemiddelde inkomst</Text><Text style={stijlen.statWaarde}>{euro(inkomsten.length > 0 ? totaalInkomsten / inkomsten.length : 0)}</Text></View>
                  <View style={stijlen.rij}><Text style={stijlen.rijLabel}>Gemiddelde uitgave</Text><Text style={stijlen.statWaarde}>{euro(uitgaven.length > 0 ? totaalUitgaven / uitgaven.length : 0)}</Text></View>
                </View>
              </>
            )}

            {tabActief === 'inkomsten' && (
              <>
                <View style={stijlen.totaalBalk}>
                  <Text style={stijlen.totaalBalkLabel}>Totaal inkomsten</Text>
                  <Text style={stijlen.totaalBalkBedrag}>{euro(totaalInkomsten)}</Text>
                </View>
                {Object.keys(inkomstenPerCategorie).length === 0 ? (
                  <View style={stijlen.legeKaart}><Text style={stijlen.leegIcoon}>💰</Text><Text style={stijlen.leegeTekst}>Geen inkomsten in {periodeLabel()}</Text></View>
                ) : (
                  Object.entries(inkomstenPerCategorie).map(([categorie, data]) => (
                    <View key={categorie} style={stijlen.categorieKaart}>
                      <View style={stijlen.categorieKoptekst}>
                        <View style={stijlen.categorieLinks}>
                          <Text style={stijlen.categorieIcoon}>{CATEGORIE_ICONEN[categorie] || '📎'}</Text>
                          <View>
                            <Text style={stijlen.categorieNaam}>{categorie}</Text>
                            <Text style={stijlen.categorieAantal}>{data.items.length} transactie{data.items.length !== 1 ? 's' : ''}</Text>
                          </View>
                        </View>
                        <Text style={stijlen.categorieBedragGroen}>{euro(data.totaal)}</Text>
                      </View>
                      <View style={stijlen.procentBalkContainer}>
                        <View style={[stijlen.procentBalkVulling, { width: `${procentBalk(data.totaal, totaalInkomsten)}%` as any, backgroundColor: '#4CAF50' }]} />
                      </View>
                      <Text style={stijlen.procentTekst}>{procentBalk(data.totaal, totaalInkomsten).toFixed(1)}% van totaal</Text>
                      {data.items.map(t => (
                        <View key={t.id} style={stijlen.transactieRegel}>
                          <View style={{ flex: 1 }}>
                            <Text style={stijlen.transactieRegelTekst}>{t.omschrijving}</Text>
                            <Text style={stijlen.transactieRegelDatum}>{t.datum} · BTW {t.btwTarief}</Text>
                          </View>
                          <Text style={stijlen.transactieRegelBedragGroen}>{euro(parseFloat(t.bedrag))}</Text>
                        </View>
                      ))}
                    </View>
                  ))
                )}
              </>
            )}

            {tabActief === 'uitgaven' && (
              <>
                <View style={[stijlen.totaalBalk, { borderColor: '#f44336' }]}>
                  <Text style={stijlen.totaalBalkLabel}>Totaal uitgaven</Text>
                  <Text style={[stijlen.totaalBalkBedrag, { color: '#f44336' }]}>{euro(totaalUitgaven)}</Text>
                </View>
                {Object.keys(uitgavenPerCategorie).length === 0 ? (
                  <View style={stijlen.legeKaart}><Text style={stijlen.leegIcoon}>🧾</Text><Text style={stijlen.leegeTekst}>Geen uitgaven in {periodeLabel()}</Text></View>
                ) : (
                  Object.entries(uitgavenPerCategorie).map(([categorie, data]) => (
                    <View key={categorie} style={stijlen.categorieKaart}>
                      <View style={stijlen.categorieKoptekst}>
                        <View style={stijlen.categorieLinks}>
                          <Text style={stijlen.categorieIcoon}>{CATEGORIE_ICONEN[categorie] || '📎'}</Text>
                          <View>
                            <Text style={stijlen.categorieNaam}>{categorie}</Text>
                            <Text style={stijlen.categorieAantal}>{data.items.length} transactie{data.items.length !== 1 ? 's' : ''}</Text>
                          </View>
                        </View>
                        <Text style={stijlen.categorieBedragRood}>{euro(data.totaal)}</Text>
                      </View>
                      <View style={stijlen.procentBalkContainer}>
                        <View style={[stijlen.procentBalkVulling, { width: `${procentBalk(data.totaal, totaalUitgaven)}%` as any, backgroundColor: '#f44336' }]} />
                      </View>
                      <Text style={stijlen.procentTekst}>{procentBalk(data.totaal, totaalUitgaven).toFixed(1)}% van totaal</Text>
                      {data.items.map(t => (
                        <View key={t.id} style={stijlen.transactieRegel}>
                          <View style={{ flex: 1 }}>
                            <Text style={stijlen.transactieRegelTekst}>{t.omschrijving}</Text>
                            <Text style={stijlen.transactieRegelDatum}>{t.datum}</Text>
                          </View>
                          <Text style={stijlen.transactieRegelBedragRood}>-{euro(parseFloat(t.bedrag))}</Text>
                        </View>
                      ))}
                    </View>
                  ))
                )}
              </>
            )}

            {pakket === 'gratis' ? (
              <View style={stijlen.premiumKaart}>
                <Text style={stijlen.premiumIcoon}>🔒</Text>
                <Text style={stijlen.premiumTitel}>PDF exporteren is Premium</Text>
                <Text style={stijlen.premiumOndertitel}>Upgrade om rapporten te exporteren en te delen via WhatsApp, e-mail en meer</Text>
                <TouchableOpacity style={stijlen.upgradeKnop} onPress={() => router.push('/(tabs)/abonnement')}>
                  <Text style={stijlen.upgradeKnopTekst}>⚡ Upgraden naar Premium</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={stijlen.pdfActiesKaart}>
                <Text style={stijlen.pdfActiesTitel}>RAPPORT EXPORTEREN</Text>
                <TouchableOpacity style={stijlen.pdfDelenKnop} onPress={rapportPdfDelen} disabled={pdfBezig}>
                  {pdfBezig ? <ActivityIndicator color="#ffffff" /> : (
                    <>
                      <Text style={stijlen.pdfDelenIcoon}>📤</Text>
                      <View>
                        <Text style={stijlen.pdfDelenTitel}>Rapport delen als PDF</Text>
                        <Text style={stijlen.pdfDelenOndertitel}>WhatsApp, e-mail, Drive, Dropbox...</Text>
                      </View>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={stijlen.pdfAfdrukkenKnop} onPress={rapportAfdrukken} disabled={pdfBezig}>
                  <Text style={stijlen.pdfDelenIcoon}>🖨️</Text>
                  <View>
                    <Text style={[stijlen.pdfDelenTitel, { color: '#C9A84C' }]}>Afdrukken</Text>
                    <Text style={stijlen.pdfDelenOndertitel}>Naar printer sturen</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const stijlen = StyleSheet.create({
  scherm: { flex: 1, backgroundColor: '#1A1A1A' },
  koptekst: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  terugTekst: { color: '#C9A84C', fontSize: 15, fontWeight: '600' },
  koptekstTitel: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  pdfKnopTekst: { color: '#C9A84C', fontSize: 14, fontWeight: '700' },
  periodeContainer: { backgroundColor: '#242424', padding: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  periodeKnoppen: { flexDirection: 'row', gap: 8 },
  periodeKnop: { flex: 1, backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  periodeKnopActief: { backgroundColor: '#003DA5', borderColor: '#003DA5' },
  periodeKnopTekst: { color: '#555', fontSize: 13, fontWeight: '600' },
  periodeKnopTekstActief: { color: '#ffffff', fontWeight: '700' },
  subSelectie: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  subOptie: { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  subOptieActief: { backgroundColor: '#C9A84C', borderColor: '#C9A84C' },
  subOptieTekst: { color: '#555', fontSize: 12 },
  subOptieTekstActief: { color: '#1A1A1A', fontWeight: '700' },
  periodeLabel: { color: '#C9A84C', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  tabBar: { flexDirection: 'row', backgroundColor: '#1A1A1A', borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActief: { borderBottomColor: '#FF6B00' },
  tabTekst: { color: '#555', fontSize: 12, fontWeight: '600' },
  tabTekstActief: { color: '#FF6B00', fontWeight: '800' },
  scrollInhoud: { padding: 16, paddingBottom: 40 },
  kaart: { backgroundColor: '#242424', borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: '#2a2a2a', gap: 10 },
  kaartTitel: { color: '#666', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 4 },
  btwSectieLabel: { color: '#555', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginTop: 4, marginBottom: 2 },
  rij: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rijLabel: { color: '#888', fontSize: 13 },
  rijLabelGroot: { color: '#ffffff', fontSize: 14, fontWeight: '700', flex: 1, flexWrap: 'wrap' },
  bedragGroen: { color: '#4CAF50', fontSize: 14, fontWeight: '700' },
  bedragRood: { color: '#f44336', fontSize: 14, fontWeight: '700' },
  bedragOranje: { color: '#FF6B00', fontSize: 14, fontWeight: '700' },
  bedragGroot: { fontSize: 18, fontWeight: '900' },
  scheidingslijn: { height: 1, backgroundColor: '#333' },
  winstMarge: { backgroundColor: '#1a2e1a', borderRadius: 8, padding: 8, alignItems: 'center' },
  winstMargeTekst: { color: '#4CAF50', fontSize: 13, fontWeight: '700' },
  statWaarde: { color: '#C9A84C', fontSize: 14, fontWeight: '700' },
  totaalBalk: { backgroundColor: '#242424', borderRadius: 14, padding: 16, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#4CAF50' },
  totaalBalkLabel: { color: '#888', fontSize: 14 },
  totaalBalkBedrag: { color: '#4CAF50', fontSize: 20, fontWeight: '900' },
  categorieKaart: { backgroundColor: '#242424', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2a2a2a', gap: 8 },
  categorieKoptekst: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categorieLinks: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  categorieIcoon: { fontSize: 24 },
  categorieNaam: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  categorieAantal: { color: '#555', fontSize: 11, marginTop: 2 },
  categorieBedragGroen: { color: '#4CAF50', fontSize: 16, fontWeight: '800' },
  categorieBedragRood: { color: '#f44336', fontSize: 16, fontWeight: '800' },
  procentBalkContainer: { height: 6, backgroundColor: '#333', borderRadius: 3, overflow: 'hidden' },
  procentBalkVulling: { height: 6, borderRadius: 3 },
  procentTekst: { color: '#555', fontSize: 11 },
  transactieRegel: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#2a2a2a' },
  transactieRegelTekst: { color: '#aaa', fontSize: 13 },
  transactieRegelDatum: { color: '#555', fontSize: 11, marginTop: 2 },
  transactieRegelBedragGroen: { color: '#4CAF50', fontSize: 13, fontWeight: '700' },
  transactieRegelBedragRood: { color: '#f44336', fontSize: 13, fontWeight: '700' },
  legeKaart: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  leegIcoon: { fontSize: 36 },
  leegeTekst: { color: '#666', fontSize: 15, fontWeight: '600' },
  premiumKaart: { backgroundColor: '#1e1a0e', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#3a2e0a', alignItems: 'center', gap: 10, marginTop: 8 },
  premiumIcoon: { fontSize: 36 },
  premiumTitel: { color: '#C9A84C', fontSize: 16, fontWeight: '800' },
  premiumOndertitel: { color: '#666', fontSize: 13, textAlign: 'center', lineHeight: 20 },
  upgradeKnop: { backgroundColor: '#FF6B00', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, marginTop: 4 },
  upgradeKnopTekst: { color: '#1A1A1A', fontSize: 14, fontWeight: '800' },
  pdfActiesKaart: { backgroundColor: '#242424', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2a2a2a', gap: 10, marginTop: 8 },
  pdfActiesTitel: { color: '#888', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  pdfDelenKnop: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#003DA5', padding: 16, borderRadius: 14 },
  pdfAfdrukkenKnop: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#1e1a0e', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#3a2e0a' },
  pdfDelenIcoon: { fontSize: 28 },
  pdfDelenTitel: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  pdfDelenOndertitel: { color: '#aaa', fontSize: 12, marginTop: 2 },
});