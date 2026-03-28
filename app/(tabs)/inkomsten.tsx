import { useLocalSearchParams, useRouter } from 'expo-router';
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
  const { gebruiker } = gebruikGebruiker();
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
        <View style={{ width: 60 }} />
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
              <TouchableOpacity style={stijlen.categorieSelecteer} onPress={() => setCategorieModalZichtbaar(true)}>
                <Text style={categorie ? stijlen.categorieGeselecteerd : stijlen.categoriePlaceholder}>
                  {categorie || 'Selecteer categorie...'}
                </Text>
                <Text style={stijlen.categorieKnopIcoon}>▼</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </View>
      </Modal>

      {/* CATEGORIE SELECTIE MODAL */}
      <Modal visible={categorieModalZichtbaar} animationType="slide" presentationStyle="pageSheet">
        <View style={stijlen.modalScherm}>
          <View style={stijlen.modalKoptekst}>
            <TouchableOpacity onPress={() => setCategorieModalZichtbaar(false)}>
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
                  onPress={() => { setCategorie(cat); setCategorieModalZichtbaar(false); }}>
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
});