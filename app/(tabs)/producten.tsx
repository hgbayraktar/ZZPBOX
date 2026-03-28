import { useRouter } from 'expo-router';
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
import { gebruikPakket, gebruikProducten } from '../../hooks/gebruikData';

const BTW_OPTIES = ['21%', '9%', '0%', 'Verlegd', 'Vrijgesteld'];
const EENHEDEN = ['uur', 'dag', 'stuk', 'project', 'm²', 'km', 'maand'];

const BTW_KLEUREN: Record<string, string> = {
  '21%': '#FF6B00',
  '9%': '#C9A84C',
  '0%': '#4CAF50',
  'Verlegd': '#003DA5',
  'Vrijgesteld': '#003DA5',
};

export default function ProductenScherm() {
  const router = useRouter();
  const pakket = gebruikPakket();
  const { producten, laden, toevoegen, bijwerken, verwijderen } = gebruikProducten();

  const [zoekterm, setZoekterm] = useState('');
  const [modalZichtbaar, setModalZichtbaar] = useState(false);
  const [bewerkId, setBewerkId] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);

  const [naam, setNaam] = useState('');
  const [omschrijving, setOmschrijving] = useState('');
  const [prijs, setPrijs] = useState('');
  const [btw, setBtw] = useState('21%');
  const [eenheid, setEenheid] = useState('uur');

  const gefilterd = producten.filter(p =>
    p.naam?.toLowerCase().includes(zoekterm.toLowerCase()) ||
    p.omschrijving?.toLowerCase().includes(zoekterm.toLowerCase())
  );

  function veldenWissen() {
    setNaam(''); setOmschrijving(''); setPrijs('');
    setBtw('21%'); setEenheid('uur'); setBewerkId(null);
  }

  function nieuwProduct() {
    if (pakket === 'gratis' && producten.length >= 5) {
      Alert.alert('Limiet bereikt', 'Maximum van 5 producten bereikt in het gratis pakket.', [
        { text: 'Annuleren', style: 'cancel' },
        { text: 'Upgraden', onPress: () => router.push('/(tabs)/abonnement') }
      ]);
      return;
    }
    veldenWissen();
    setModalZichtbaar(true);
  }

  function productBewerken(product: any) {
    setNaam(product.naam || '');
    setOmschrijving(product.omschrijving || '');
    setPrijs(product.prijs || '');
    setBtw(product.btw || '21%');
    setEenheid(product.eenheid || 'uur');
    setBewerkId(product.id);
    setModalZichtbaar(true);
  }

  async function productOpslaan() {
    if (!naam || !prijs) {
      Alert.alert('Verplichte velden', 'Vul naam en prijs in.');
      return;
    }
    setBezig(true);
    const gegevens = { naam, omschrijving, prijs, btw, eenheid };
    try {
      if (bewerkId) {
        await bijwerken(bewerkId, gegevens);
      } else {
        await toevoegen(gegevens);
      }
      setModalZichtbaar(false);
      veldenWissen();
    } catch (e) {
      Alert.alert('Fout', 'Kon product niet opslaan. Probeer opnieuw.');
    } finally {
      setBezig(false);
    }
  }

  function bevestigVerwijderen(id: string, naam: string) {
    Alert.alert('Product verwijderen', `Weet u zeker dat u ${naam} wilt verwijderen?`, [
      { text: 'Annuleren', style: 'cancel' },
      { text: 'Verwijderen', style: 'destructive', onPress: () => verwijderen(id) }
    ]);
  }

  function berekenBtwBedrag(p: string, tarief: string): number {
    const bedrag = parseFloat(p.replace(',', '.') || '0');
    if (tarief === '21%') return bedrag * 0.21;
    if (tarief === '9%') return bedrag * 0.09;
    return 0;
  }

  function euro(b: number) {
    return `€ ${b.toFixed(2).replace('.', ',')}`;
  }

  return (
    <View style={stijlen.scherm}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />

      <View style={stijlen.koptekst}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/instellingen')}>
  <Text style={stijlen.terugTekst}>← Terug</Text>
</TouchableOpacity>
        <Text style={stijlen.koptekstTitel}>Producten & Diensten</Text>
        <TouchableOpacity style={stijlen.toevoegenKnop} onPress={nieuwProduct}>
          <Text style={stijlen.toevoegenTekst}>+ Nieuw</Text>
        </TouchableOpacity>
      </View>

      {pakket === 'gratis' && (
        <View style={stijlen.limietBalk}>
          <Text style={stijlen.limietTekst}>{producten.length} / 5 producten gebruikt</Text>
        </View>
      )}

      <View style={stijlen.zoekContainer}>
        <TextInput
          style={stijlen.zoekInvoer}
          placeholder="🔍 Zoek op naam of omschrijving..."
          placeholderTextColor="#444"
          value={zoekterm}
          onChangeText={setZoekterm}
        />
      </View>

      <ScrollView contentContainerStyle={stijlen.scrollInhoud}>
        {laden ? (
          <ActivityIndicator color="#C9A84C" style={{ marginTop: 40 }} />
        ) : gefilterd.length === 0 ? (
          <View style={stijlen.legeKaart}>
            <Text style={stijlen.leegIcoon}>📦</Text>
            <Text style={stijlen.leegeTekst}>
              {zoekterm ? 'Geen producten gevonden' : 'Nog geen producten of diensten'}
            </Text>
            <Text style={stijlen.leegeOndertekst}>
              {zoekterm ? 'Probeer een andere zoekterm' : 'Voeg uw eerste product of dienst toe'}
            </Text>
          </View>
        ) : (
          gefilterd.map(product => {
            const p = parseFloat(product.prijs?.replace(',', '.') || '0');
            const btwBedrag = berekenBtwBedrag(product.prijs || '0', product.btw);
            const inclBtw = p + btwBedrag;
            return (
              <TouchableOpacity
                key={product.id}
                style={stijlen.productKaart}
                onPress={() => productBewerken(product)}
                activeOpacity={0.8}>
                <View style={stijlen.productKoptekst}>
                  <View style={{ flex: 1 }}>
                    <Text style={stijlen.productNaam}>{product.naam}</Text>
                    {product.omschrijving ? (
                      <Text style={stijlen.productOmschrijving}>{product.omschrijving}</Text>
                    ) : null}
                  </View>
                  <View style={stijlen.productRechts}>
                    <View style={[stijlen.btwBadge, { backgroundColor: (BTW_KLEUREN[product.btw] || '#888') + '22', borderColor: BTW_KLEUREN[product.btw] || '#888' }]}>
                      <Text style={[stijlen.btwBadgeTekst, { color: BTW_KLEUREN[product.btw] || '#888' }]}>
                        BTW {product.btw}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => bevestigVerwijderen(product.id, product.naam)}>
                      <Text style={stijlen.verwijderIcoon}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={stijlen.prijsRij}>
                  <View style={stijlen.prijsItem}>
                    <Text style={stijlen.prijsLabel}>Excl. BTW</Text>
                    <Text style={stijlen.prijsBedrag}>{euro(p)}</Text>
                  </View>
                  {(product.btw === '21%' || product.btw === '9%') && (
                    <View style={stijlen.prijsItem}>
                      <Text style={stijlen.prijsLabel}>BTW</Text>
                      <Text style={stijlen.prijsBedrag}>{euro(btwBedrag)}</Text>
                    </View>
                  )}
                  <View style={stijlen.prijsItem}>
                    <Text style={stijlen.prijsLabel}>Incl. BTW</Text>
                    <Text style={stijlen.prijsHoofd}>{euro(inclBtw)}</Text>
                  </View>
                  <View style={stijlen.eenheidBadge}>
                    <Text style={stijlen.eenheidTekst}>per {product.eenheid}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <Modal visible={modalZichtbaar} animationType="slide" presentationStyle="pageSheet">
        <View style={stijlen.modalScherm}>
          <View style={stijlen.modalKoptekst}>
            <TouchableOpacity onPress={() => { setModalZichtbaar(false); veldenWissen(); }}>
              <Text style={stijlen.annulerenTekst}>Annuleren</Text>
            </TouchableOpacity>
            <Text style={stijlen.modalTitel}>{bewerkId ? 'Product bewerken' : 'Product toevoegen'}</Text>
            <TouchableOpacity onPress={productOpslaan} disabled={bezig}>
              <Text style={stijlen.opslaanTekst}>{bezig ? '...' : 'Opslaan'}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={stijlen.modalInhoud} keyboardShouldPersistTaps="handled">

            <View style={stijlen.invoerGroep}>
              <Text style={stijlen.label}>Naam <Text style={stijlen.verplicht}>*</Text></Text>
              <TextInput style={stijlen.invoer} placeholder="Bijv. Webdesign, Advies..." placeholderTextColor="#444" value={naam} onChangeText={setNaam} />
            </View>

            <View style={stijlen.invoerGroep}>
              <Text style={stijlen.label}>Omschrijving</Text>
              <TextInput style={[stijlen.invoer, { height: 80, textAlignVertical: 'top' }]} placeholder="Korte omschrijving (optioneel)" placeholderTextColor="#444" multiline value={omschrijving} onChangeText={setOmschrijving} />
            </View>

            <View style={stijlen.invoerGroep}>
              <Text style={stijlen.label}>Prijs excl. BTW <Text style={stijlen.verplicht}>*</Text></Text>
              <View style={stijlen.bedragRij}>
                <Text style={stijlen.euroTekst}>€</Text>
                <TextInput style={stijlen.bedragInvoer} placeholder="0,00" placeholderTextColor="#444" keyboardType="decimal-pad" value={prijs} onChangeText={setPrijs} />
              </View>
              {prijs.length > 0 && (
                <View style={stijlen.prijsBerekening}>
                  <Text style={stijlen.prijsBerekeningTekst}>
                    BTW ({btw}): {euro(berekenBtwBedrag(prijs, btw))}
                  </Text>
                  <Text style={stijlen.prijsBerekeningTotaal}>
                    Incl. BTW: {euro(parseFloat(prijs.replace(',', '.') || '0') + berekenBtwBedrag(prijs, btw))}
                  </Text>
                </View>
              )}
            </View>

            <View style={stijlen.invoerGroep}>
              <Text style={stijlen.label}>BTW tarief</Text>
              <View style={stijlen.opties}>
                {BTW_OPTIES.map(o => (
                  <TouchableOpacity
                    key={o}
                    style={[stijlen.optie, btw === o && { backgroundColor: (BTW_KLEUREN[o] || '#888') + '33', borderColor: BTW_KLEUREN[o] || '#888' }]}
                    onPress={() => setBtw(o)}>
                    <Text style={[stijlen.optieTekst, btw === o && { color: BTW_KLEUREN[o] || '#888', fontWeight: '700' }]}>{o}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={stijlen.invoerGroep}>
              <Text style={stijlen.label}>Eenheid</Text>
              <View style={stijlen.opties}>
                {EENHEDEN.map(e => (
                  <TouchableOpacity
                    key={e}
                    style={[stijlen.optie, eenheid === e && stijlen.optieActief]}
                    onPress={() => setEenheid(e)}>
                    <Text style={[stijlen.optieTekst, eenheid === e && stijlen.optieTekstActief]}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

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
  toevoegenKnop: { backgroundColor: '#FF6B00', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  toevoegenTekst: { color: '#1A1A1A', fontSize: 13, fontWeight: '800' },
  limietBalk: { backgroundColor: '#1e1a0e', padding: 10, borderBottomWidth: 1, borderBottomColor: '#3a2e0a', alignItems: 'center' },
  limietTekst: { color: '#C9A84C', fontSize: 12, fontWeight: '600' },
  zoekContainer: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  zoekInvoer: { backgroundColor: '#242424', borderWidth: 1, borderColor: '#333', borderRadius: 12, padding: 12, color: '#ffffff', fontSize: 14 },
  scrollInhoud: { padding: 16, paddingBottom: 40 },
  legeKaart: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  leegIcoon: { fontSize: 48 },
  leegeTekst: { color: '#666', fontSize: 16, fontWeight: '600' },
  leegeOndertekst: { color: '#444', fontSize: 13, textAlign: 'center' },
  productKaart: { backgroundColor: '#242424', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2a2a2a' },
  productKoptekst: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  productNaam: { color: '#ffffff', fontSize: 15, fontWeight: '700', marginBottom: 2 },
  productOmschrijving: { color: '#666', fontSize: 12 },
  productRechts: { alignItems: 'flex-end', gap: 8 },
  btwBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  btwBadgeTekst: { fontSize: 11, fontWeight: '700' },
  verwijderIcoon: { fontSize: 18 },
  prijsRij: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  prijsItem: { alignItems: 'center' },
  prijsLabel: { color: '#555', fontSize: 10, marginBottom: 2 },
  prijsBedrag: { color: '#888', fontSize: 13, fontWeight: '600' },
  prijsHoofd: { color: '#C9A84C', fontSize: 15, fontWeight: '800' },
  eenheidBadge: { backgroundColor: '#1A1A1A', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#333', marginLeft: 'auto' },
  eenheidTekst: { color: '#555', fontSize: 11 },
  modalScherm: { flex: 1, backgroundColor: '#1A1A1A' },
  modalKoptekst: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  annulerenTekst: { color: '#888', fontSize: 15, fontWeight: '600', width: 80 },
  modalTitel: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  opslaanTekst: { color: '#FF6B00', fontSize: 15, fontWeight: '700', width: 80, textAlign: 'right' },
  modalInhoud: { padding: 20, paddingBottom: 60 },
  invoerGroep: { marginBottom: 20 },
  label: { color: '#888', fontSize: 13, fontWeight: '600', marginBottom: 8, letterSpacing: 0.5 },
  verplicht: { color: '#FF6B00' },
  invoer: { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333', borderRadius: 12, padding: 14, color: '#ffffff', fontSize: 15 },
  bedragRij: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333', borderRadius: 12 },
  euroTekst: { color: '#C9A84C', fontSize: 18, fontWeight: '700', paddingLeft: 14 },
  bedragInvoer: { flex: 1, padding: 14, color: '#ffffff', fontSize: 15 },
  prijsBerekening: { backgroundColor: '#1a1a2e', borderRadius: 10, padding: 12, marginTop: 8, gap: 4 },
  prijsBerekeningTekst: { color: '#888', fontSize: 13 },
  prijsBerekeningTotaal: { color: '#C9A84C', fontSize: 14, fontWeight: '700' },
  opties: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optie: { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  optieActief: { backgroundColor: '#003DA5', borderColor: '#003DA5' },
  optieTekst: { color: '#555', fontSize: 13, fontWeight: '600' },
  optieTekstActief: { color: '#ffffff', fontWeight: '700' },
});