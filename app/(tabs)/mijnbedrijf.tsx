import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet, Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { gebruikBedrijf, gebruikPakket } from '../../hooks/gebruikData';

export default function MijnBedrijfScherm() {
  const router = useRouter();
  const pakket = gebruikPakket();
  const { bedrijf, laden, opslaan } = gebruikBedrijf();
  const [bezig, setBezig] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);

  const [bedrijfsnaam, setBedrijfsnaam] = useState('');
  const [naamEigenaar, setNaamEigenaar] = useState('');
  const [kvkNummer, setKvkNummer] = useState('');
  const [btwNummer, setBtwNummer] = useState('');
  const [straat, setStraat] = useState('');
  const [huisnummer, setHuisnummer] = useState('');
  const [postcode, setPostcode] = useState('');
  const [plaats, setPlaats] = useState('');
  const [email, setEmail] = useState('');
  const [telefoon, setTelefoon] = useState('');
  const [website, setWebsite] = useState('');
  const [iban, setIban] = useState('');
  const [banknaam, setBanknaam] = useState('');

  useEffect(() => {
    if (bedrijf && Object.keys(bedrijf).length > 0) {
      setBedrijfsnaam(bedrijf.bedrijfsnaam || '');
      setNaamEigenaar(bedrijf.naamEigenaar || '');
      setKvkNummer(bedrijf.kvkNummer || '');
      setBtwNummer(bedrijf.btwNummer || '');
      setStraat(bedrijf.straat || '');
      setHuisnummer(bedrijf.huisnummer || '');
      setPostcode(bedrijf.postcode || '');
      setPlaats(bedrijf.plaats || '');
      setEmail(bedrijf.email || '');
      setTelefoon(bedrijf.telefoon || '');
      setWebsite(bedrijf.website || '');
      setIban(bedrijf.iban || '');
      setBanknaam(bedrijf.banknaam || '');
    }
    AsyncStorage.getItem('bedrijfLogo').then(opgeslagenLogo => {
      if (opgeslagenLogo) setLogo(opgeslagenLogo);
    });
  }, [bedrijf]);

  async function logoKiezen() {
    if (pakket !== 'premium') {
      Alert.alert('Premium functie', 'Logo uploaden is alleen beschikbaar in Premium.', [
        { text: 'Annuleren', style: 'cancel' },
        { text: 'Upgraden', onPress: () => router.push('/(tabs)/abonnement') }
      ]);
      return;
    }
    const toestemming = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!toestemming.granted) {
      Alert.alert('Toestemming vereist', 'Geef toegang tot uw fotobibliotheek in de instellingen.');
      return;
    }
    const resultaat = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });
    if (!resultaat.canceled && resultaat.assets[0]) {
      const bestand = resultaat.assets[0];
      if (bestand.fileSize && bestand.fileSize > 1048576) {
        Alert.alert('Bestand te groot', 'Maximale bestandsgrootte is 1 MB.');
        return;
      }
      const logoUri = bestand.uri;
      setLogo(logoUri);
      await AsyncStorage.setItem('bedrijfLogo', logoUri);
    }
  }

  async function logoVerwijderen() {
    Alert.alert('Logo verwijderen', 'Weet u zeker dat u het logo wilt verwijderen?', [
      { text: 'Annuleren', style: 'cancel' },
      { text: 'Verwijderen', style: 'destructive', onPress: async () => {
        setLogo(null);
        await AsyncStorage.removeItem('bedrijfLogo');
      }}
    ]);
  }

  async function gegevensOpslaan() {
    if (!bedrijfsnaam || !naamEigenaar || !kvkNummer || !email) {
      Alert.alert('Verplichte velden', 'Vul bedrijfsnaam, naam eigenaar, KvK-nummer en e-mailadres in.');
      return;
    }
    setBezig(true);
    try {
      await opslaan({
        bedrijfsnaam, naamEigenaar, kvkNummer, btwNummer,
        straat, huisnummer, postcode, plaats,
        email, telefoon, website, iban, banknaam,
      });
      Alert.alert('Opgeslagen', 'Bedrijfsgegevens zijn opgeslagen.');
    } catch (e) {
      Alert.alert('Fout', 'Kon gegevens niet opslaan. Probeer opnieuw.');
    } finally {
      setBezig(false);
    }
  }

  return (
    <View style={stijlen.scherm}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />

      <View style={stijlen.koptekst}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/instellingen')}>
  <Text style={stijlen.terugTekst}>← Terug</Text>
</TouchableOpacity>
        <Text style={stijlen.koptekstTitel}>Mijn Bedrijf</Text>
        <TouchableOpacity onPress={gegevensOpslaan} disabled={bezig}>
          <Text style={stijlen.opslaanTekst}>{bezig ? '...' : 'Opslaan'}</Text>
        </TouchableOpacity>
      </View>

      {laden ? (
        <ActivityIndicator color="#C9A84C" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={stijlen.scrollInhoud} keyboardShouldPersistTaps="handled">

          {/* LOGO */}
          <View style={stijlen.sectie}>
            <Text style={stijlen.sectieKoptekst}>🖼️ Bedrijfslogo</Text>
            {pakket !== 'premium' ? (
              <TouchableOpacity
                style={stijlen.premiumLogoKaart}
                onPress={() => router.push('/(tabs)/abonnement')}>
                <Text style={stijlen.premiumLogoIcoon}>🔒</Text>
                <Text style={stijlen.premiumLogoTekst}>Logo uploaden is een Premium functie</Text>
                <Text style={stijlen.premiumLogoOndertekst}>Upgrade voor bedrijfslogo op facturen</Text>
              </TouchableOpacity>
            ) : logo ? (
              <View style={stijlen.logoContainer}>
                <Image source={{ uri: logo }} style={stijlen.logoAfbeelding} />
                <View style={stijlen.logoActies}>
                  <TouchableOpacity style={stijlen.logoWijzigenKnop} onPress={logoKiezen}>
                    <Text style={stijlen.logoWijzigenTekst}>Wijzigen</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={stijlen.logoVerwijderenKnop} onPress={logoVerwijderen}>
                    <Text style={stijlen.logoVerwijderenTekst}>Verwijderen</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={stijlen.logoUploadKaart} onPress={logoKiezen}>
                <Text style={stijlen.logoUploadIcoon}>📁</Text>
                <Text style={stijlen.logoUploadTekst}>Tik om logo te uploaden</Text>
                <Text style={stijlen.logoUploadVereisten}>JPG of PNG · Max. 1 MB · 400×400px aanbevolen</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* BEDRIJFSGEGEVENS */}
          <View style={stijlen.sectie}>
            <Text style={stijlen.sectieKoptekst}>🏢 Bedrijfsgegevens</Text>
            <View style={stijlen.invoerGroep}>
              <Text style={stijlen.label}>Bedrijfsnaam <Text style={stijlen.verplicht}>*</Text></Text>
              <TextInput style={stijlen.invoer} placeholder="Naam van uw bedrijf" placeholderTextColor="#444" value={bedrijfsnaam} onChangeText={setBedrijfsnaam} />
            </View>
            <View style={stijlen.invoerGroep}>
              <Text style={stijlen.label}>Naam eigenaar <Text style={stijlen.verplicht}>*</Text></Text>
              <TextInput style={stijlen.invoer} placeholder="Voor- en achternaam" placeholderTextColor="#444" value={naamEigenaar} onChangeText={setNaamEigenaar} />
            </View>
            <View style={stijlen.tweeKolommen}>
              <View style={[stijlen.invoerGroep, { flex: 1 }]}>
                <Text style={stijlen.label}>KvK-nummer <Text style={stijlen.verplicht}>*</Text></Text>
                <TextInput style={stijlen.invoer} placeholder="12345678" placeholderTextColor="#444" keyboardType="numeric" value={kvkNummer} onChangeText={setKvkNummer} />
              </View>
              <View style={[stijlen.invoerGroep, { flex: 1 }]}>
                <Text style={stijlen.label}>BTW-nummer</Text>
                <TextInput style={stijlen.invoer} placeholder="NL123456789B01" placeholderTextColor="#444" autoCapitalize="characters" value={btwNummer} onChangeText={setBtwNummer} />
              </View>
            </View>
          </View>

          {/* ADRESGEGEVENS */}
          <View style={stijlen.sectie}>
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
          </View>

          {/* CONTACTGEGEVENS */}
          <View style={stijlen.sectie}>
            <Text style={stijlen.sectieKoptekst}>📞 Contactgegevens</Text>
            <View style={stijlen.invoerGroep}>
              <Text style={stijlen.label}>E-mailadres <Text style={stijlen.verplicht}>*</Text></Text>
              <TextInput style={stijlen.invoer} placeholder="info@uwbedrijf.nl" placeholderTextColor="#444" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
            </View>
            <View style={stijlen.tweeKolommen}>
              <View style={[stijlen.invoerGroep, { flex: 1 }]}>
                <Text style={stijlen.label}>Telefoon</Text>
                <TextInput style={stijlen.invoer} placeholder="06-12345678" placeholderTextColor="#444" keyboardType="phone-pad" value={telefoon} onChangeText={setTelefoon} />
              </View>
              <View style={[stijlen.invoerGroep, { flex: 1 }]}>
                <Text style={stijlen.label}>Website</Text>
                <TextInput style={stijlen.invoer} placeholder="www.uwbedrijf.nl" placeholderTextColor="#444" autoCapitalize="none" value={website} onChangeText={setWebsite} />
              </View>
            </View>
          </View>

          {/* BANKGEGEVENS */}
          <View style={stijlen.sectie}>
            <Text style={stijlen.sectieKoptekst}>🏦 Bankgegevens</Text>
            <View style={stijlen.invoerGroep}>
              <Text style={stijlen.label}>IBAN</Text>
              <TextInput style={stijlen.invoer} placeholder="NL00 BANK 0000 0000 00" placeholderTextColor="#444" autoCapitalize="characters" value={iban} onChangeText={setIban} />
            </View>
            <View style={stijlen.invoerGroep}>
              <Text style={stijlen.label}>Bank naam</Text>
              <TextInput style={stijlen.invoer} placeholder="Bijv. ING, Rabobank, ABN AMRO" placeholderTextColor="#444" value={banknaam} onChangeText={setBanknaam} />
            </View>
          </View>

          <TouchableOpacity
            style={[stijlen.opslaanKnop, bezig && { opacity: 0.7 }]}
            onPress={gegevensOpslaan}
            disabled={bezig}>
            {bezig ? (
              <ActivityIndicator color="#1A1A1A" />
            ) : (
              <Text style={stijlen.opslaanKnopTekst}>💾 Gegevens opslaan</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      )}
    </View>
  );
}

const stijlen = StyleSheet.create({
  scherm: { flex: 1, backgroundColor: '#1A1A1A' },
  koptekst: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  terugTekst: { color: '#C9A84C', fontSize: 15, fontWeight: '600' },
  koptekstTitel: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  opslaanTekst: { color: '#FF6B00', fontSize: 15, fontWeight: '700' },
  scrollInhoud: { padding: 20, paddingBottom: 60 },
  sectie: { backgroundColor: '#242424', borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#2a2a2a', gap: 12 },
  sectieKoptekst: { color: '#C9A84C', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
  premiumLogoKaart: { backgroundColor: '#1e1a0e', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#3a2e0a', alignItems: 'center', gap: 6 },
  premiumLogoIcoon: { fontSize: 32 },
  premiumLogoTekst: { color: '#C9A84C', fontSize: 14, fontWeight: '700' },
  premiumLogoOndertekst: { color: '#666', fontSize: 12 },
  logoContainer: { alignItems: 'center', gap: 12 },
  logoAfbeelding: { width: 120, height: 120, borderRadius: 12, borderWidth: 1, borderColor: '#333' },
  logoActies: { flexDirection: 'row', gap: 12 },
  logoWijzigenKnop: { backgroundColor: '#003DA5', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  logoWijzigenTekst: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  logoVerwijderenKnop: { backgroundColor: '#2d1e1e', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#4a2d2d' },
  logoVerwijderenTekst: { color: '#f44336', fontSize: 13, fontWeight: '700' },
  logoUploadKaart: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 24, borderWidth: 1, borderColor: '#333', borderStyle: 'dashed', alignItems: 'center', gap: 8 },
  logoUploadIcoon: { fontSize: 36 },
  logoUploadTekst: { color: '#888', fontSize: 14, fontWeight: '600' },
  logoUploadVereisten: { color: '#555', fontSize: 11, textAlign: 'center' },
  tweeKolommen: { flexDirection: 'row', gap: 12 },
  invoerGroep: { gap: 6 },
  label: { color: '#888', fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },
  verplicht: { color: '#FF6B00' },
  invoer: { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333', borderRadius: 12, padding: 14, color: '#ffffff', fontSize: 15 },
  opslaanKnop: { backgroundColor: '#FF6B00', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 8, shadowColor: '#FF6B00', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 },
  opslaanKnopTekst: { color: '#1A1A1A', fontSize: 16, fontWeight: '900' },
});