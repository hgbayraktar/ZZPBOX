import * as Print from 'expo-print';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';
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
import { gebruikCategorieën, gebruikGebruiker, gebruikPakket, gebruikTransacties } from '../../hooks/gebruikData';

const BTW_OPTIES = ['21%', '9%', '0%', 'Verlegd', 'Vrijgesteld'];

export default function TransactiesScherm() {
  const router = useRouter();
  gebruikGebruiker();
  const pakket = gebruikPakket();
  const { transacties, laden, toevoegen, verwijderen } = gebruikTransacties();
  const { alleNamen } = gebruikCategorieën();

  const [modalZichtbaar, setModalZichtbaar] = useState(false);
  const [categorieModalZichtbaar, setCategorieModalZichtbaar] = useState(false);
  const [soort, setSoort] = useState<'inkomst' | 'uitgave'>('inkomst');
  const [omschrijving, setOmschrijving] = useState('');
  const [bedrag, setBedrag] = useState('');
  const [btw, setBtw] = useState('21%');
  const [categorie, setCategorie] = useState('');
  const [bezig, setBezig] = useState(false);
  const [exportModalZichtbaar, setExportModalZichtbaar] = useState(false);
  const [exportBezig, setExportBezig] = useState(false);
  const [vanDatum, setVanDatum] = useState('');
  const [totDatum, setTotDatum] = useState('');

  const { soort: soortParam } = useLocalSearchParams<{ soort?: string }>();

  useEffect(() => {
    if (soortParam === 'uitgave') nieuweTransactie('uitgave');
    else if (soortParam === 'inkomst') nieuweTransactie('inkomst');
  }, []);

  const vandaag = new Date().toISOString().split('T')[0];
  const dezeMaand = new Date().toISOString().slice(0, 7);

  const dagTransacties = transacties.filter(t => t.aangemaaktOp?.startsWith(vandaag));
  const maandTransacties = transacties.filter(t => t.aangemaaktOp?.startsWith(dezeMaand));

  const dagLimiet = pakket === 'gratis' ? 3 : Infinity;
  const maandLimiet = pakket === 'gratis' ? 20 : Infinity;

  const inkomsten = transacties.filter(t => t.soort === 'inkomst');
  const uitgaven = transacties.filter(t => t.soort === 'uitgave');

  const totaalInkomsten = inkomsten.reduce((s, t) => s + parseFloat(t.bedrag || '0'), 0);
  const totaalUitgaven = uitgaven.reduce((s, t) => s + parseFloat(t.bedrag || '0'), 0);

  const inkomstenCategorieën = alleNamen('inkomst');
  const uitgavenCategorieën = alleNamen('uitgave');

  function euro(b: number) {
    return `€ ${b.toFixed(2).replace('.', ',')}`;
  }

  function berekenBtw(b: number, tarief: string) {
    if (tarief === '21%') return b * 0.21;
    if (tarief === '9%') return b * 0.09;
    return 0;
  }

  function nieuweTransactie(type: 'inkomst' | 'uitgave') {
    if (pakket === 'gratis') {
      if (dagTransacties.length >= dagLimiet) {
        Alert.alert('Daglimiet bereikt', 'Maximum van 3 invoeren per dag bereikt.', [
          { text: 'Annuleren', style: 'cancel' },
          { text: 'Upgraden', onPress: () => router.push('/(tabs)/abonnement') }
        ]);
        return;
      }
      if (maandTransacties.length >= maandLimiet) {
        Alert.alert('Maandlimiet bereikt', 'Maximum van 20 invoeren per maand bereikt.', [
          { text: 'Annuleren', style: 'cancel' },
          { text: 'Upgraden', onPress: () => router.push('/(tabs)/abonnement') }
        ]);
        return;
      }
    }
    setSoort(type);
    setOmschrijving(''); setBedrag(''); setBtw('21%'); setCategorie('');
    setModalZichtbaar(true);
  }

  async function transactieOpslaan() {
    if (!omschrijving || !bedrag) {
      Alert.alert('Verplichte velden', 'Vul omschrijving en bedrag in.');
      return;
    }
    setBezig(true);
    try {
      const b = parseFloat(bedrag.replace(',', '.'));
      await toevoegen({
        soort,
        omschrijving,
        bedrag: b.toString(),
        btwTarief: btw,
        btwBedrag: berekenBtw(b, btw).toString(),
        categorie,
        datum: new Date().toLocaleDateString('nl-NL'),
      });
      setModalZichtbaar(false);
    } catch (e) {
      Alert.alert('Fout', 'Kon transactie niet opslaan. Probeer opnieuw.');
    } finally {
      setBezig(false);
    }
  }

  function snelPeriode(type: 'deze-maand' | 'vorige-maand' | 'kwartaal' | 'jaar') {
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

  async function exporteerPdf() {
    if (!vanDatum || !totDatum) {
      Alert.alert('Selecteer periode', 'Vul een begin- en einddatum in.');
      return;
    }
    const gefilterd = transacties.filter(t => {
      const d = t.aangemaaktOp?.slice(0, 10) || '';
      return d >= vanDatum && d <= totDatum;
    }).sort((a, b) => b.aangemaaktOp?.localeCompare(a.aangemaaktOp));

    if (gefilterd.length === 0) {
      Alert.alert('Geen transacties', 'Er zijn geen transacties in deze periode.');
      return;
    }

    const euro = (b: number) => `€ ${b.toFixed(2).replace('.', ',')}`;
    const totInkomsten = gefilterd.filter(t => t.soort === 'inkomst').reduce((s, t) => s + parseFloat(t.bedrag || '0'), 0);
    const totUitgaven = gefilterd.filter(t => t.soort === 'uitgave').reduce((s, t) => s + parseFloat(t.bedrag || '0'), 0);
    const totBtw = gefilterd.reduce((s, t) => s + parseFloat(t.btwBedrag || '0'), 0);

    const rijen = gefilterd.map(t => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0;">${t.datum}</td>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0;">${t.omschrijving}</td>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0;">${t.categorie || '-'}</td>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0;">${t.btwTarief}</td>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0;text-align:right;color:${t.soort === 'inkomst' ? '#4CAF50' : '#f44336'};">
          ${t.soort === 'inkomst' ? '+' : '-'}${euro(parseFloat(t.bedrag))}
        </td>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0;text-align:right;color:#888;">${euro(parseFloat(t.btwBedrag || '0'))}</td>
      </tr>
    `).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <style>
      body{font-family:Arial,sans-serif;padding:32px;color:#1a1a1a;}
      h1{color:#C9A84C;font-size:24px;margin-bottom:4px;}
      .periode{color:#888;font-size:13px;margin-bottom:24px;}
      table{width:100%;border-collapse:collapse;font-size:13px;}
      th{background:#1a1a1a;color:#C9A84C;padding:10px 8px;text-align:left;}
      th:last-child,th:nth-last-child(2){text-align:right;}
      .totaal{margin-top:24px;background:#f8f8f8;border-radius:8px;padding:16px;}
      .totaal-rij{display:flex;justify-content:space-between;padding:6px 0;font-size:14px;}
      .groen{color:#4CAF50;font-weight:700;}
      .rood{color:#f44336;font-weight:700;}
      .goud{color:#C9A84C;font-weight:700;}
    </style></head><body>
    <h1>ZZPBox — Transactieoverzicht</h1>
    <div class="periode">Periode: ${vanDatum} t/m ${totDatum} &nbsp;·&nbsp; ${gefilterd.length} transacties</div>
    <table>
      <thead><tr>
        <th>Datum</th><th>Omschrijving</th><th>Categorie</th><th>BTW</th><th>Bedrag</th><th>BTW bedrag</th>
      </tr></thead>
      <tbody>${rijen}</tbody>
    </table>
    <div class="totaal">
      <div class="totaal-rij"><span>Totaal inkomsten</span><span class="groen">${euro(totInkomsten)}</span></div>
      <div class="totaal-rij"><span>Totaal uitgaven</span><span class="rood">-${euro(totUitgaven)}</span></div>
      <div class="totaal-rij"><span>Totaal BTW</span><span class="goud">${euro(totBtw)}</span></div>
      <div class="totaal-rij" style="border-top:1px solid #ddd;margin-top:8px;padding-top:12px;font-weight:700;font-size:15px;">
        <span>Saldo</span><span class="${totInkomsten - totUitgaven >= 0 ? 'groen' : 'rood'}">${euro(totInkomsten - totUitgaven)}</span>
      </div>
    </div>
    </body></html>`;

    setExportBezig(true);
    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
      setExportModalZichtbaar(false);
    } catch (e) {
      Alert.alert('Fout', 'Kon PDF niet aanmaken.');
    } finally {
      setExportBezig(false);
    }
  }

  function bevestigVerwijderen(id: string) {
    Alert.alert('Verwijderen', 'Weet u zeker dat u deze transactie wilt verwijderen?', [
      { text: 'Annuleren', style: 'cancel' },
      { text: 'Verwijderen', style: 'destructive', onPress: () => verwijderen(id) }
    ]);
  }

  const huidigeCategorieën = soort === 'inkomst' ? inkomstenCategorieën : uitgavenCategorieën;

  return (
    <View style={stijlen.scherm}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />

      <View style={stijlen.koptekst}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={stijlen.terugTekst}>← Terug</Text>
        </TouchableOpacity>
        <Text style={stijlen.koptekstTitel}>Transacties</Text>
        <TouchableOpacity onPress={() => {
          if (pakket !== 'premium') {
            Alert.alert('Premium functie', 'PDF export is beschikbaar voor Premium gebruikers.', [
              { text: 'Annuleren', style: 'cancel' },
              { text: 'Upgraden', onPress: () => router.push('/(tabs)/abonnement') }
            ]);
            return;
          }
          setExportModalZichtbaar(true);
        }}>
          <Text style={stijlen.exportKnop}>PDF</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={stijlen.scrollInhoud}>

        <View style={stijlen.overzichtRij}>
          <View style={[stijlen.overzichtKaart, { borderColor: '#4CAF50' }]}>
            <Text style={stijlen.overzichtLabel}>Inkomsten</Text>
            <Text style={stijlen.bedragGroen}>{euro(totaalInkomsten)}</Text>
          </View>
          <View style={[stijlen.overzichtKaart, { borderColor: '#f44336' }]}>
            <Text style={stijlen.overzichtLabel}>Uitgaven</Text>
            <Text style={stijlen.bedragRood}>{euro(totaalUitgaven)}</Text>
          </View>
        </View>

        {pakket === 'gratis' && (
          <View style={stijlen.limietKaart}>
            <Text style={stijlen.limietTitel}>Dagelijks gebruik</Text>
            <Text style={stijlen.limietTekst}>{dagTransacties.length} / {dagLimiet} vandaag</Text>
            <View style={stijlen.limietBalk}>
              <View style={[stijlen.limietVoortgang, { width: `${Math.min((dagTransacties.length / dagLimiet) * 100, 100)}%` }]} />
            </View>
            <Text style={stijlen.limietTekst}>{maandTransacties.length} / {maandLimiet} deze maand</Text>
            <View style={stijlen.limietBalk}>
              <View style={[stijlen.limietVoortgang, { width: `${Math.min((maandTransacties.length / maandLimiet) * 100, 100)}%` }]} />
            </View>
          </View>
        )}

        <View style={stijlen.knoppen}>
          <TouchableOpacity style={[stijlen.knop, stijlen.inkomstKnop]} onPress={() => nieuweTransactie('inkomst')} activeOpacity={0.8}>
            <Text style={stijlen.knopTekst}>+ Inkomst toevoegen</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[stijlen.knop, stijlen.uitgaveKnop]} onPress={() => nieuweTransactie('uitgave')} activeOpacity={0.8}>
            <Text style={stijlen.knopTekst}>+ Uitgave toevoegen</Text>
          </TouchableOpacity>
        </View>

        {laden ? (
          <ActivityIndicator color="#C9A84C" style={{ marginTop: 40 }} />
        ) : transacties.length === 0 ? (
          <View style={stijlen.legeKaart}>
            <Text style={stijlen.leegIcoon}>💰</Text>
            <Text style={stijlen.leegeTekst}>Nog geen transacties</Text>
            <Text style={stijlen.leegeOndertekst}>Voeg uw eerste inkomst of uitgave toe</Text>
          </View>
        ) : (
          <>
            {[...transacties]
              .sort((a, b) => b.aangemaaktOp?.localeCompare(a.aangemaaktOp))
              .map(t => (
                <TouchableOpacity
                  key={t.id}
                  style={stijlen.transactieKaart}
                  onLongPress={() => bevestigVerwijderen(t.id)}
                  activeOpacity={0.8}>
                  <View style={[stijlen.transactieBalk, { backgroundColor: t.soort === 'inkomst' ? '#4CAF50' : '#f44336' }]} />
                  <View style={stijlen.transactieInhoud}>
                    <View style={{ flex: 1 }}>
                      <Text style={stijlen.transactieOmschrijving}>{t.omschrijving}</Text>
                      <Text style={stijlen.transactieMeta}>{t.datum} · {t.categorie || 'Geen categorie'} · BTW {t.btwTarief}</Text>
                    </View>
                    <View style={stijlen.transactieRechts}>
                      <Text style={[stijlen.transactieBedrag, { color: t.soort === 'inkomst' ? '#4CAF50' : '#f44336' }]}>
                        {t.soort === 'inkomst' ? '+' : '-'}{euro(parseFloat(t.bedrag))}
                      </Text>
                      <Text style={stijlen.transactieBtw}>BTW: {euro(parseFloat(t.btwBedrag || '0'))}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            <Text style={stijlen.verwijderenTip}>💡 Lang ingedrukt houden om te verwijderen</Text>
          </>
        )}
      </ScrollView>

      {/* TRANSACTIE MODAL */}
      <Modal visible={modalZichtbaar} animationType="slide" presentationStyle="pageSheet">
        <View style={stijlen.modalScherm}>
          <View style={stijlen.modalKoptekst}>
            <TouchableOpacity onPress={() => setModalZichtbaar(false)}>
              <Text style={stijlen.annulerenTekst}>Annuleren</Text>
            </TouchableOpacity>
            <Text style={stijlen.modalTitel}>{soort === 'inkomst' ? '💰 Inkomst' : '🧾 Uitgave'} toevoegen</Text>
            <TouchableOpacity onPress={transactieOpslaan} disabled={bezig}>
              <Text style={stijlen.opslaanTekst}>{bezig ? '...' : 'Opslaan'}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={stijlen.modalInhoud} keyboardShouldPersistTaps="handled">

            <View style={stijlen.invoerGroep}>
              <Text style={stijlen.label}>Omschrijving <Text style={stijlen.verplicht}>*</Text></Text>
              <TextInput style={stijlen.invoer} placeholder="Bijv. Webdesign werkzaamheden" placeholderTextColor="#444" value={omschrijving} onChangeText={setOmschrijving} />
            </View>

            <View style={stijlen.invoerGroep}>
              <Text style={stijlen.label}>Bedrag excl. BTW <Text style={stijlen.verplicht}>*</Text></Text>
              <View style={stijlen.bedragRij}>
                <Text style={stijlen.euroTekst}>€</Text>
                <TextInput style={stijlen.bedragInvoer} placeholder="0,00" placeholderTextColor="#444" keyboardType="decimal-pad" value={bedrag} onChangeText={setBedrag} />
              </View>
              {bedrag.length > 0 && (
                <View style={stijlen.btwBerekening}>
                  <Text style={stijlen.btwBerekeningTekst}>BTW ({btw}): {euro(berekenBtw(parseFloat(bedrag.replace(',', '.') || '0'), btw))}</Text>
                  <Text style={stijlen.btwBerekeningTotaal}>Incl. BTW: {euro(parseFloat(bedrag.replace(',', '.') || '0') + berekenBtw(parseFloat(bedrag.replace(',', '.') || '0'), btw))}</Text>
                </View>
              )}
            </View>

            <View style={stijlen.invoerGroep}>
              <Text style={stijlen.label}>BTW tarief</Text>
              <View style={stijlen.btwOpties}>
                {BTW_OPTIES.map(o => (
                  <TouchableOpacity key={o} style={[stijlen.btwOptie, btw === o && stijlen.btwOptieActief]} onPress={() => setBtw(o)}>
                    <Text style={[stijlen.btwOptieTekst, btw === o && stijlen.btwOptieTekstActief]}>{o}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={stijlen.invoerGroep}>
              <View style={stijlen.labelRij}>
                <Text style={stijlen.label}>Categorie</Text>
                <TouchableOpacity onPress={() => { setModalZichtbaar(false); router.push('/(tabs)/categorieen'); }}>
                  <Text style={stijlen.beheerTekst}>⚙️ Beheer categorieën</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={stijlen.categorieSelecteer} onPress={() => { setModalZichtbaar(false); setCategorieModalZichtbaar(true); }}>
                <Text style={categorie ? stijlen.categorieGeselecteerd : stijlen.categoriePlaceholder}>
                  {categorie || 'Selecteer categorie...'}
                </Text>
                <Text style={stijlen.categorieKnopIcoon}>▼</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </View>
      </Modal>

      {/* EXPORT MODAL */}
      <Modal visible={exportModalZichtbaar} animationType="slide" presentationStyle="pageSheet">
        <View style={stijlen.modalScherm}>
          <View style={stijlen.modalKoptekst}>
            <TouchableOpacity onPress={() => setExportModalZichtbaar(false)}>
              <Text style={stijlen.annulerenTekst}>Annuleren</Text>
            </TouchableOpacity>
            <Text style={stijlen.modalTitel}>PDF exporteren</Text>
            <View style={{ width: 80 }} />
          </View>
          <ScrollView contentContainerStyle={stijlen.modalInhoud}>
            <Text style={[stijlen.label, { marginBottom: 12 }]}>Snelle selectie</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {[
                { label: 'Deze maand', type: 'deze-maand' as const },
                { label: 'Vorige maand', type: 'vorige-maand' as const },
                { label: 'Dit kwartaal', type: 'kwartaal' as const },
                { label: 'Dit jaar', type: 'jaar' as const },
              ].map(p => (
                <TouchableOpacity key={p.type} style={stijlen.periodeKnop} onPress={() => snelPeriode(p.type)}>
                  <Text style={stijlen.periodeKnopTekst}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={stijlen.invoerGroep}>
              <Text style={stijlen.label}>Van (JJJJ-MM-DD)</Text>
              <TextInput style={stijlen.invoer} placeholder="2026-01-01" placeholderTextColor="#444" value={vanDatum} onChangeText={setVanDatum} />
            </View>
            <View style={stijlen.invoerGroep}>
              <Text style={stijlen.label}>Tot (JJJJ-MM-DD)</Text>
              <TextInput style={stijlen.invoer} placeholder="2026-12-31" placeholderTextColor="#444" value={totDatum} onChangeText={setTotDatum} />
            </View>
            <TouchableOpacity style={[stijlen.exportKnopGroot, exportBezig && { opacity: 0.7 }]} onPress={exporteerPdf} disabled={exportBezig}>
              {exportBezig ? <ActivityIndicator color="#1A1A1A" /> : <Text style={stijlen.exportKnopGrootTekst}>PDF genereren & delen</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* CATEGORIE SELECTIE MODAL */}
      <Modal visible={categorieModalZichtbaar} animationType="slide" presentationStyle="fullScreen">
        <View style={stijlen.modalScherm}>
          <View style={stijlen.modalKoptekst}>
            <TouchableOpacity onPress={() => { setCategorieModalZichtbaar(false); setTimeout(() => setModalZichtbaar(true), 300); }}>
              <Text style={stijlen.annulerenTekst}>Annuleren</Text>
            </TouchableOpacity>
            <Text style={stijlen.modalTitel}>Categorie kiezen</Text>
            <View style={{ width: 80 }} />
          </View>
          <ScrollView contentContainerStyle={stijlen.modalInhoud}>
            {huidigeCategorieën.length === 0 ? (
              <View style={stijlen.legeKaart}>
                <Text style={stijlen.leegeTekst}>Geen categorieën gevonden</Text>
                <TouchableOpacity onPress={() => { setCategorieModalZichtbaar(false); setModalZichtbaar(false); router.push('/(tabs)/categorieen'); }}>
                  <Text style={stijlen.beheerTekst}>⚙️ Categorieën beheren</Text>
                </TouchableOpacity>
              </View>
            ) : (
              huidigeCategorieën.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[stijlen.categorieOptie, categorie === cat && stijlen.categorieOptieActief]}
                  onPress={() => { setCategorie(cat); setCategorieModalZichtbaar(false); setTimeout(() => setModalZichtbaar(true), 300); }}>
                  <Text style={[stijlen.categorieOptieTekst, categorie === cat && stijlen.categorieOptieTekstActief]}>
                    {cat}
                  </Text>
                  {categorie === cat && <Text style={stijlen.vinkje}>✓</Text>}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
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
  scrollInhoud: { padding: 16, paddingBottom: 40 },
  overzichtRij: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  overzichtKaart: { flex: 1, backgroundColor: '#242424', borderRadius: 14, padding: 16, borderWidth: 1 },
  overzichtLabel: { color: '#666', fontSize: 12, marginBottom: 6 },
  bedragGroen: { color: '#4CAF50', fontSize: 18, fontWeight: '800' },
  bedragRood: { color: '#f44336', fontSize: 18, fontWeight: '800' },
  limietKaart: { backgroundColor: '#1e1a0e', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#3a2e0a', marginBottom: 16, gap: 6 },
  limietTitel: { color: '#C9A84C', fontSize: 13, fontWeight: '700', marginBottom: 4 },
  limietTekst: { color: '#888', fontSize: 12 },
  limietBalk: { height: 4, backgroundColor: '#333', borderRadius: 2, overflow: 'hidden' },
  limietVoortgang: { height: 4, backgroundColor: '#C9A84C', borderRadius: 2 },
  knoppen: { gap: 10, marginBottom: 20 },
  knop: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  inkomstKnop: { backgroundColor: '#1e2d1e', borderWidth: 1, borderColor: '#2d4a2d' },
  uitgaveKnop: { backgroundColor: '#2d1e1e', borderWidth: 1, borderColor: '#4a2d2d' },
  knopTekst: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  legeKaart: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  leegIcoon: { fontSize: 48 },
  leegeTekst: { color: '#666', fontSize: 16, fontWeight: '600' },
  leegeOndertekst: { color: '#444', fontSize: 13, textAlign: 'center' },
  transactieKaart: { flexDirection: 'row', backgroundColor: '#242424', borderRadius: 14, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#2a2a2a' },
  transactieBalk: { width: 4 },
  transactieInhoud: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', padding: 14, alignItems: 'center' },
  transactieOmschrijving: { color: '#ffffff', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  transactieMeta: { color: '#555', fontSize: 11 },
  transactieRechts: { alignItems: 'flex-end' },
  transactieBedrag: { fontSize: 15, fontWeight: '800' },
  transactieBtw: { color: '#555', fontSize: 11, marginTop: 2 },
  verwijderenTip: { color: '#333', fontSize: 11, textAlign: 'center', marginTop: 8 },
  modalScherm: { flex: 1, backgroundColor: '#1A1A1A' },
  modalKoptekst: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  annulerenTekst: { color: '#888', fontSize: 15, fontWeight: '600', width: 80 },
  modalTitel: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
  opslaanTekst: { color: '#FF6B00', fontSize: 15, fontWeight: '700', width: 80, textAlign: 'right' },
  modalInhoud: { padding: 20, paddingBottom: 60 },
  invoerGroep: { marginBottom: 20 },
  label: { color: '#888', fontSize: 13, fontWeight: '600', marginBottom: 8, letterSpacing: 0.5 },
  labelRij: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  beheerTekst: { color: '#C9A84C', fontSize: 12, fontWeight: '600' },
  verplicht: { color: '#FF6B00' },
  invoer: { backgroundColor: '#242424', borderWidth: 1, borderColor: '#333', borderRadius: 12, padding: 14, color: '#ffffff', fontSize: 15 },
  bedragRij: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#242424', borderWidth: 1, borderColor: '#333', borderRadius: 12 },
  euroTekst: { color: '#C9A84C', fontSize: 18, fontWeight: '700', paddingLeft: 14 },
  bedragInvoer: { flex: 1, padding: 14, color: '#ffffff', fontSize: 15 },
  btwBerekening: { backgroundColor: '#1a1a2e', borderRadius: 10, padding: 12, marginTop: 8, gap: 4 },
  btwBerekeningTekst: { color: '#888', fontSize: 13 },
  btwBerekeningTotaal: { color: '#C9A84C', fontSize: 14, fontWeight: '700' },
  btwOpties: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  btwOptie: { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  btwOptieActief: { backgroundColor: '#003DA5', borderColor: '#003DA5' },
  btwOptieTekst: { color: '#555', fontSize: 13, fontWeight: '600' },
  btwOptieTekstActief: { color: '#ffffff', fontWeight: '700' },
  categorieSelecteer: { backgroundColor: '#242424', borderWidth: 1, borderColor: '#333', borderRadius: 12, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categorieGeselecteerd: { color: '#ffffff', fontSize: 15 },
  categoriePlaceholder: { color: '#444', fontSize: 15 },
  categorieKnopIcoon: { color: '#555', fontSize: 12 },
  categorieOptie: { backgroundColor: '#242424', borderRadius: 12, padding: 16, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#2a2a2a' },
  categorieOptieActief: { backgroundColor: '#1a1a2e', borderColor: '#003DA5' },
  categorieOptieTekst: { color: '#888', fontSize: 15 },
  categorieOptieTekstActief: { color: '#ffffff', fontWeight: '700' },
  vinkje: { color: '#003DA5', fontSize: 16, fontWeight: '700' },
  exportKnop: { color: '#C9A84C', fontSize: 13, fontWeight: '800', width: 60, textAlign: 'right' },
  periodeKnop: { backgroundColor: '#242424', borderWidth: 1, borderColor: '#333', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  periodeKnopTekst: { color: '#aaa', fontSize: 13, fontWeight: '600' },
  exportKnopGroot: { backgroundColor: '#C9A84C', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  exportKnopGrootTekst: { color: '#1A1A1A', fontSize: 16, fontWeight: '900' },
});