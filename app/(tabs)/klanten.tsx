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
import { gebruikKlanten, gebruikPakket } from '../../hooks/gebruikData';

export default function KlantenScherm() {
  const router = useRouter();
  const pakket = gebruikPakket();
  const { klanten, laden, toevoegen, bijwerken, verwijderen } = gebruikKlanten();

  const [zoekterm, setZoekterm] = useState('');
  const [modalZichtbaar, setModalZichtbaar] = useState(false);
  const [bewerkId, setBewerkId] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);

  const [bedrijfsnaam, setBedrijfsnaam] = useState('');
  const [contactpersoon, setContactpersoon] = useState('');
  const [email, setEmail] = useState('');
  const [telefoon, setTelefoon] = useState('');
  const [website, setWebsite] = useState('');
  const [kvkNummer, setKvkNummer] = useState('');
  const [btwNummer, setBtwNummer] = useState('');
  const [straat, setStraat] = useState('');
  const [huisnummer, setHuisnummer] = useState('');
  const [postcode, setPostcode] = useState('');
  const [plaats, setPlaats] = useState('');

  const gefilterd = klanten.filter(k =>
    k.bedrijfsnaam?.toLowerCase().includes(zoekterm.toLowerCase()) ||
    k.contactpersoon?.toLowerCase().includes(zoekterm.toLowerCase()) ||
    k.plaats?.toLowerCase().includes(zoekterm.toLowerCase())
  );

  function veldenWissen() {
    setBedrijfsnaam(''); setContactpersoon(''); setEmail('');
    setTelefoon(''); setWebsite(''); setKvkNummer('');
    setBtwNummer(''); setStraat(''); setHuisnummer('');
    setPostcode(''); setPlaats('');
    setBewerkId(null);
  }

  function nieuweKlant() {
    if (pakket === 'gratis' && klanten.length >= 3) {
      Alert.alert('Limiet bereikt', 'Maximum van 3 klanten bereikt in het gratis pakket.', [
        { text: 'Annuleren', style: 'cancel' },
        { text: 'Upgraden', onPress: () => router.push('/(tabs)/abonnement') }
      ]);
      return;
    }
    veldenWissen();
    setModalZichtbaar(true);
  }

  function klantBewerken(klant: any) {
    setBedrijfsnaam(klant.bedrijfsnaam || '');
    setContactpersoon(klant.contactpersoon || '');
    setEmail(klant.email || '');
    setTelefoon(klant.telefoon || '');
    setWebsite(klant.website || '');
    setKvkNummer(klant.kvkNummer || '');
    setBtwNummer(klant.btwNummer || '');
    setStraat(klant.straat || '');
    setHuisnummer(klant.huisnummer || '');
    setPostcode(klant.postcode || '');
    setPlaats(klant.plaats || '');
    setBewerkId(klant.id);
    setModalZichtbaar(true);
  }

  async function klantOpslaan() {
    if (!bedrijfsnaam || !email) {
      Alert.alert('Verplichte velden', 'Vul bedrijfsnaam en e-mailadres in.');
      return;
    }
    setBezig(true);
    const gegevens = {
      bedrijfsnaam, contactpersoon, email, telefoon,
      website, kvkNummer, btwNummer, straat,
      huisnummer, postcode, plaats,
    };
    try {
      if (bewerkId) {
        await bijwerken(bewerkId, gegevens);
      } else {
        await toevoegen(gegevens);
      }
      setModalZichtbaar(false);
      veldenWissen();
    } catch (e) {
      Alert.alert('Fout', 'Kon klant niet opslaan. Probeer opnieuw.');
    } finally {
      setBezig(false);
    }
  }

  function bevestigVerwijderen(id: string, naam: string) {
    Alert.alert('Klant verwijderen', `Weet u zeker dat u ${naam} wilt verwijderen?`, [
      { text: 'Annuleren', style: 'cancel' },
      { text: 'Verwijderen', style: 'destructive', onPress: () => verwijderen(id) }
    ]);
  }

  return (
    <View style={stijlen.scherm}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />

      <View style={stijlen.koptekst}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/instellingen')}>
  <Text style={stijlen.terugTekst}>← Terug</Text>
</TouchableOpacity>
        <Text style={stijlen.koptekstTitel}>Klanten</Text>
        <TouchableOpacity style={stijlen.toevoegenKnop} onPress={nieuweKlant}>
          <Text style={stijlen.toevoegenTekst}>+ Nieuw</Text>
        </TouchableOpacity>
      </View>

      {pakket === 'gratis' && (
        <View style={stijlen.limietBalk}>
          <Text style={stijlen.limietTekst}>{klanten.length} / 3 klanten gebruikt</Text>
        </View>
      )}

      <View style={stijlen.zoekContainer}>
        <TextInput
          style={stijlen.zoekInvoer}
          placeholder="🔍 Zoek op naam, contactpersoon of plaats..."
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
            <Text style={stijlen.leegIcoon}>👥</Text>
            <Text style={stijlen.leegeTekst}>
              {zoekterm ? 'Geen klanten gevonden' : 'Nog geen klanten'}
            </Text>
            <Text style={stijlen.leegeOndertekst}>
              {zoekterm ? 'Probeer een andere zoekterm' : 'Voeg uw eerste klant toe'}
            </Text>
          </View>
        ) : (
          gefilterd.map(klant => (
            <TouchableOpacity
              key={klant.id}
              style={stijlen.klantKaart}
              onPress={() => klantBewerken(klant)}
              activeOpacity={0.8}>
              <View style={stijlen.klantAvatar}>
                <Text style={stijlen.klantAvatarTekst}>
                  {klant.bedrijfsnaam?.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={stijlen.klantInfo}>
                <Text style={stijlen.klantNaam}>{klant.bedrijfsnaam}</Text>
                {klant.contactpersoon ? <Text style={stijlen.klantDetail}>👤 {klant.contactpersoon}</Text> : null}
                {klant.plaats ? <Text style={stijlen.klantDetail}>📍 {klant.plaats}</Text> : null}
                {klant.email ? <Text style={stijlen.klantDetail}>✉️ {klant.email}</Text> : null}
              </View>
              <TouchableOpacity
                style={stijlen.verwijderKnop}
                onPress={() => bevestigVerwijderen(klant.id, klant.bedrijfsnaam)}>
                <Text style={stijlen.verwijderIcoon}>🗑️</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal visible={modalZichtbaar} animationType="slide" presentationStyle="pageSheet">
        <View style={stijlen.modalScherm}>
          <View style={stijlen.modalKoptekst}>
            <TouchableOpacity onPress={() => { setModalZichtbaar(false); veldenWissen(); }}>
              <Text style={stijlen.annulerenTekst}>Annuleren</Text>
            </TouchableOpacity>
            <Text style={stijlen.modalTitel}>{bewerkId ? 'Klant bewerken' : 'Klant toevoegen'}</Text>
            <TouchableOpacity onPress={klantOpslaan} disabled={bezig}>
              <Text style={stijlen.opslaanTekst}>{bezig ? '...' : 'Opslaan'}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={stijlen.modalInhoud} keyboardShouldPersistTaps="handled">

            <Text style={stijlen.sectieKoptekst}>🏢 Bedrijfsgegevens</Text>
            <View style={stijlen.invoerGroep}>
              <Text style={stijlen.label}>Bedrijfsnaam <Text style={stijlen.verplicht}>*</Text></Text>
              <TextInput style={stijlen.invoer} placeholder="Naam bedrijf" placeholderTextColor="#444" value={bedrijfsnaam} onChangeText={setBedrijfsnaam} />
            </View>
            <View style={stijlen.invoerGroep}>
              <Text style={stijlen.label}>Contactpersoon</Text>
              <TextInput style={stijlen.invoer} placeholder="Voor- en achternaam" placeholderTextColor="#444" value={contactpersoon} onChangeText={setContactpersoon} />
            </View>
            <View style={stijlen.tweeKolommen}>
              <View style={[stijlen.invoerGroep, { flex: 1 }]}>
                <Text style={stijlen.label}>KvK-nummer</Text>
                <TextInput style={stijlen.invoer} placeholder="12345678" placeholderTextColor="#444" keyboardType="numeric" value={kvkNummer} onChangeText={setKvkNummer} />
              </View>
              <View style={[stijlen.invoerGroep, { flex: 1 }]}>
                <Text style={stijlen.label}>BTW-nummer</Text>
                <TextInput style={stijlen.invoer} placeholder="NL123456789B01" placeholderTextColor="#444" autoCapitalize="characters" value={btwNummer} onChangeText={setBtwNummer} />
              </View>
            </View>

            <Text style={stijlen.sectieKoptekst}>📞 Contactgegevens</Text>
            <View style={stijlen.invoerGroep}>
              <Text style={stijlen.label}>E-mailadres <Text style={stijlen.verplicht}>*</Text></Text>
              <TextInput style={stijlen.invoer} placeholder="info@bedrijf.nl" placeholderTextColor="#444" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
            </View>
            <View style={stijlen.tweeKolommen}>
              <View style={[stijlen.invoerGroep, { flex: 1 }]}>
                <Text style={stijlen.label}>Telefoon</Text>
                <TextInput style={stijlen.invoer} placeholder="06-12345678" placeholderTextColor="#444" keyboardType="phone-pad" value={telefoon} onChangeText={setTelefoon} />
              </View>
              <View style={[stijlen.invoerGroep, { flex: 1 }]}>
                <Text style={stijlen.label}>Website</Text>
                <TextInput style={stijlen.invoer} placeholder="www.bedrijf.nl" placeholderTextColor="#444" autoCapitalize="none" value={website} onChangeText={setWebsite} />
              </View>
            </View>

            <Text style={stijlen.sectieKoptekst}>📍 Adresgegevens</Text>
            <View style={stijlen.tweeKolommen}>
              <View style={[stijlen.invoerGroep, { flex: 2 }]}>
                <Text style={stijlen.label}>Straat</Text>
                <TextInput style={stijlen.invoer} placeholder="Straatnaam" placeholderTextColor="#444" value={straat} onChangeText={setStraat} />
              </View>
              <View style={[stijlen.invoerGroep, { flex: 1 }]}>
                <Text style={stijlen.label}>Huisnr.</Text>
                <TextInput style={stijlen.invoer} placeholder="1A" placeholderTextColor="#444" value={huisnummer} onChangeText={setHuisnummer} />
              </View>
            </View>
            <View style={stijlen.tweeKolommen}>
              <View style={[stijlen.invoerGroep, { flex: 1 }]}>
                <Text style={stijlen.label}>Postcode</Text>
                <TextInput style={stijlen.invoer} placeholder="1234 AB" placeholderTextColor="#444" autoCapitalize="characters" value={postcode} onChangeText={setPostcode} />
              </View>
              <View style={[stijlen.invoerGroep, { flex: 2 }]}>
                <Text style={stijlen.label}>Plaats</Text>
                <TextInput style={stijlen.invoer} placeholder="Amsterdam" placeholderTextColor="#444" value={plaats} onChangeText={setPlaats} />
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
  klantKaart: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#242424', borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#2a2a2a', gap: 12 },
  klantAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#003DA5', alignItems: 'center', justifyContent: 'center' },
  klantAvatarTekst: { color: '#ffffff', fontSize: 18, fontWeight: '800' },
  klantInfo: { flex: 1, gap: 3 },
  klantNaam: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  klantDetail: { color: '#666', fontSize: 12 },
  verwijderKnop: { padding: 8 },
  verwijderIcoon: { fontSize: 18 },
  modalScherm: { flex: 1, backgroundColor: '#1A1A1A' },
  modalKoptekst: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  annulerenTekst: { color: '#888', fontSize: 15, fontWeight: '600', width: 80 },
  modalTitel: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  opslaanTekst: { color: '#FF6B00', fontSize: 15, fontWeight: '700', width: 80, textAlign: 'right' },
  modalInhoud: { padding: 20, paddingBottom: 60 },
  sectieKoptekst: { color: '#C9A84C', fontSize: 13, fontWeight: '800', letterSpacing: 0.5, marginBottom: 12, marginTop: 8 },
  tweeKolommen: { flexDirection: 'row', gap: 12 },
  invoerGroep: { marginBottom: 12 },
  label: { color: '#888', fontSize: 13, fontWeight: '600', marginBottom: 6, letterSpacing: 0.5 },
  verplicht: { color: '#FF6B00' },
  invoer: { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333', borderRadius: 12, padding: 14, color: '#ffffff', fontSize: 15 },
});