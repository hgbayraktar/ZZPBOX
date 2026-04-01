import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useRouter } from 'expo-router';
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, OAuthProvider, createUserWithEmailAndPassword, signInWithCredential, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet, Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { auth, db } from '../constants/firebase';

export default function RegistrerenScherm() {
  const router = useRouter();
  const [voornaam, setVoornaam] = useState('');
  const [achternaam, setAchternaam] = useState('');
  const [email, setEmail] = useState('');
  const [wachtwoord, setWachtwoord] = useState('');
  const [bevestigWachtwoord, setBevestigWachtwoord] = useState('');
  const [toonWachtwoord, setToonWachtwoord] = useState(false);
  const [akkoord, setAkkoord] = useState(false);
  const [laden, setLaden] = useState(false);
  const [applebeschikbaar, setAppleBeschikbaar] = useState(false);

  useEffect(() => {
    AppleAuthentication.isAvailableAsync().then(setAppleBeschikbaar).catch(() => setAppleBeschikbaar(false));
  }, []);

  function wachtwoordSterkte(): { score: number; label: string; kleur: string } {
    let score = 0;
    if (wachtwoord.length >= 8) score++;
    if (/[A-Z]/.test(wachtwoord)) score++;
    if (/[a-z]/.test(wachtwoord)) score++;
    if (/[0-9]/.test(wachtwoord)) score++;
    if (/[^A-Za-z0-9]/.test(wachtwoord)) score++;
    if (score <= 2) return { score, label: 'Zwak', kleur: '#f44336' };
    if (score <= 3) return { score, label: 'Matig', kleur: '#FF6B00' };
    if (score === 4) return { score, label: 'Sterk', kleur: '#C9A84C' };
    return { score, label: 'Zeer sterk', kleur: '#4CAF50' };
  }

  const sterkte = wachtwoordSterkte();

  async function registreren() {
    if (!voornaam || !achternaam || !email || !wachtwoord || !bevestigWachtwoord) {
      Alert.alert('Verplichte velden', 'Vul alle velden in.');
      return;
    }
    if (wachtwoord !== bevestigWachtwoord) {
      Alert.alert('Wachtwoord', 'Wachtwoorden komen niet overeen.');
      return;
    }
    if (sterkte.score < 4) {
      Alert.alert('Wachtwoord te zwak', 'Gebruik minimaal 8 tekens met hoofdletter, kleine letter, cijfer en speciaal teken.');
      return;
    }
    if (!akkoord) {
      Alert.alert('Akkoord vereist', 'Ga akkoord met de voorwaarden en het privacybeleid.');
      return;
    }

    setLaden(true);
    try {
      const gebruiker = await createUserWithEmailAndPassword(auth, email, wachtwoord);

      await updateProfile(gebruiker.user, {
        displayName: `${voornaam} ${achternaam}`
      });

      const nu = new Date();
      const toestemming = {
        akkoordVoorwaarden: true,
        akkoordPrivacybeleid: true,
        akkoordDatum: nu.toLocaleDateString('nl-NL') + ' ' + nu.toLocaleTimeString('nl-NL'),
        akkoordVersie: 'v1.0',
        emailadres: email,
        voornaam,
        achternaam,
      };

      await AsyncStorage.setItem('toestemming', JSON.stringify(toestemming));

      await setDoc(doc(db, 'gebruikers', gebruiker.user.uid), {
        voornaam,
        achternaam,
        email,
        pakket: 'gratis',
        aangemaakt: nu.toISOString(),
        toestemming,
      });

      router.replace('/(tabs)/dashboard');
    } catch (fout: any) {
      let melding = 'Er is een fout opgetreden. Probeer het opnieuw.';
      if (fout.code === 'auth/email-already-in-use') melding = 'Dit e-mailadres is al in gebruik.';
      if (fout.code === 'auth/invalid-email') melding = 'Ongeldig e-mailadres.';
      if (fout.code === 'auth/weak-password') melding = 'Wachtwoord is te zwak.';
      Alert.alert('Fout', melding);
    } finally {
      setLaden(false);
    }
  }

  async function googleRegistreren() {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;
      if (!idToken) throw new Error('Geen ID token');
      const credential = GoogleAuthProvider.credential(idToken);
      const resultaat = await signInWithCredential(auth, credential);
      const gebruikerDoc = await getDoc(doc(db, 'gebruikers', resultaat.user.uid));
      if (!gebruikerDoc.exists()) {
        const nu = new Date();
        await setDoc(doc(db, 'gebruikers', resultaat.user.uid), {
          voornaam: resultaat.user.displayName?.split(' ')[0] || '',
          achternaam: resultaat.user.displayName?.split(' ').slice(1).join(' ') || '',
          email: resultaat.user.email || '',
          pakket: 'gratis',
          aangemaakt: nu.toISOString(),
        });
      }
      router.replace('/(tabs)/dashboard');
    } catch (fout: any) {
      if (fout.code !== statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('Fout', 'Registreren met Google mislukt.');
      }
    }
  }

  async function appleRegistreren() {
    try {
      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const provider = new OAuthProvider('apple.com');
      const credential = provider.credential({
        idToken: appleCredential.identityToken!,
        rawNonce: appleCredential.authorizationCode!,
      });
      const resultaat = await signInWithCredential(auth, credential);
      const gebruikerDoc = await getDoc(doc(db, 'gebruikers', resultaat.user.uid));
      if (!gebruikerDoc.exists()) {
        const nu = new Date();
        await setDoc(doc(db, 'gebruikers', resultaat.user.uid), {
          voornaam: appleCredential.fullName?.givenName || '',
          achternaam: appleCredential.fullName?.familyName || '',
          email: resultaat.user.email || '',
          pakket: 'gratis',
          aangemaakt: nu.toISOString(),
        });
      }
      router.replace('/(tabs)/dashboard');
    } catch (fout: any) {
      if (fout.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Fout', 'Registreren met Apple mislukt.');
      }
    }
  }

  return (
    <View style={stijlen.scherm}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />
      <ScrollView contentContainerStyle={stijlen.scrollInhoud} keyboardShouldPersistTaps="handled">

        <TouchableOpacity onPress={() => router.back()} style={stijlen.terugKnop}>
          <Text style={stijlen.terugTekst}>← Terug</Text>
        </TouchableOpacity>

        <Text style={stijlen.titel}>Account aanmaken</Text>
        <Text style={stijlen.ondertitel}>Gratis account aanmaken</Text>

        <View style={stijlen.rij}>
          <View style={[stijlen.invoerGroep, { flex: 1 }]}>
            <Text style={stijlen.label}>Voornaam <Text style={stijlen.verplicht}>*</Text></Text>
            <TextInput
              style={stijlen.invoer}
              placeholder="Jan"
              placeholderTextColor="#444"
              value={voornaam}
              onChangeText={setVoornaam}
              autoCapitalize="words"
            />
          </View>
          <View style={[stijlen.invoerGroep, { flex: 1 }]}>
            <Text style={stijlen.label}>Achternaam <Text style={stijlen.verplicht}>*</Text></Text>
            <TextInput
              style={stijlen.invoer}
              placeholder="de Vries"
              placeholderTextColor="#444"
              value={achternaam}
              onChangeText={setAchternaam}
              autoCapitalize="words"
            />
          </View>
        </View>

        <View style={stijlen.invoerGroep}>
          <Text style={stijlen.label}>E-mailadres <Text style={stijlen.verplicht}>*</Text></Text>
          <TextInput
            style={stijlen.invoer}
            placeholder="jan@bedrijf.nl"
            placeholderTextColor="#444"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={stijlen.invoerGroep}>
          <Text style={stijlen.label}>Wachtwoord <Text style={stijlen.verplicht}>*</Text></Text>
          <View style={stijlen.wachtwoordRij}>
            <TextInput
              style={stijlen.wachtwoordInvoer}
              placeholder="Min. 8 tekens"
              placeholderTextColor="#444"
              value={wachtwoord}
              onChangeText={setWachtwoord}
              secureTextEntry={!toonWachtwoord}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setToonWachtwoord(!toonWachtwoord)} style={stijlen.oogKnop}>
              <Text style={stijlen.oogIcoon}>{toonWachtwoord ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
          {wachtwoord.length > 0 && (
            <View style={stijlen.sterkteContainer}>
              <View style={stijlen.sterkteBalk}>
                {[1, 2, 3, 4, 5].map(i => (
                  <View key={i} style={[stijlen.sterkteSegment, { backgroundColor: i <= sterkte.score ? sterkte.kleur : '#333' }]} />
                ))}
              </View>
              <Text style={[stijlen.sterkteLabel, { color: sterkte.kleur }]}>{sterkte.label}</Text>
            </View>
          )}
          <View style={stijlen.criteriaLijst}>
            {[
              { tekst: 'Minimaal 8 tekens', geldig: wachtwoord.length >= 8 },
              { tekst: 'Hoofdletter (A-Z)', geldig: /[A-Z]/.test(wachtwoord) },
              { tekst: 'Kleine letter (a-z)', geldig: /[a-z]/.test(wachtwoord) },
              { tekst: 'Cijfer (0-9)', geldig: /[0-9]/.test(wachtwoord) },
              { tekst: 'Speciaal teken (!@#$...)', geldig: /[^A-Za-z0-9]/.test(wachtwoord) },
            ].map((c, i) => (
              <Text key={i} style={[stijlen.criterium, { color: c.geldig ? '#4CAF50' : '#555' }]}>
                {c.geldig ? '✓' : '○'} {c.tekst}
              </Text>
            ))}
          </View>
        </View>

        <View style={stijlen.invoerGroep}>
          <Text style={stijlen.label}>Wachtwoord bevestigen <Text style={stijlen.verplicht}>*</Text></Text>
          <TextInput
            style={[stijlen.invoer, bevestigWachtwoord.length > 0 && {
              borderColor: wachtwoord === bevestigWachtwoord ? '#4CAF50' : '#f44336'
            }]}
            placeholder="Herhaal wachtwoord"
            placeholderTextColor="#444"
            value={bevestigWachtwoord}
            onChangeText={setBevestigWachtwoord}
            secureTextEntry={!toonWachtwoord}
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity style={stijlen.akkoordRij} onPress={() => setAkkoord(!akkoord)} activeOpacity={0.8}>
          <View style={[stijlen.selectievakje, akkoord && stijlen.selectievakjeActief]}>
            {akkoord && <Text style={stijlen.vinkje}>✓</Text>}
          </View>
          <Text style={stijlen.akkoordTekst}>
            Ik ga akkoord met de{' '}
            <Text style={stijlen.link} onPress={() => router.push('/voorwaarden')}>algemene voorwaarden</Text>
            {' '}en het{' '}
            <Text style={stijlen.link} onPress={() => router.push('/privacybeleid')}>privacybeleid</Text>
          </Text>
        </TouchableOpacity>

        {akkoord && (
          <View style={stijlen.toestemmingKaart}>
            <Text style={stijlen.toestemmingTekst}>
              ✓ Akkoord gegeven op {new Date().toLocaleDateString('nl-NL')} om {new Date().toLocaleTimeString('nl-NL')} — versie v1.0
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[stijlen.registrerenKnop, laden && { opacity: 0.7 }]}
          onPress={registreren}
          disabled={laden}
          activeOpacity={0.8}>
          {laden ? (
            <ActivityIndicator color="#1A1A1A" />
          ) : (
            <Text style={stijlen.registrerenTekst}>Account aanmaken →</Text>
          )}
        </TouchableOpacity>

        <View style={stijlen.scheidingslijn}>
          <View style={stijlen.scheidingslijnLijn} />
          <Text style={stijlen.scheidingslijnTekst}>of</Text>
          <View style={stijlen.scheidingslijnLijn} />
        </View>

        {applebeschikbaar && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
            cornerRadius={14}
            style={stijlen.appleKnop}
            onPress={appleRegistreren}
          />
        )}

        {Platform.OS === 'android' && (
          <GoogleSigninButton
            style={stijlen.googleKnop}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={googleRegistreren}
          />
        )}

        <TouchableOpacity onPress={() => router.push('/inloggen')} style={stijlen.inloggenLink}>
          <Text style={stijlen.inloggenTekst}>Al een account? <Text style={stijlen.link}>Inloggen</Text></Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const stijlen = StyleSheet.create({
  scherm: { flex: 1, backgroundColor: '#1A1A1A' },
  scrollInhoud: { padding: 24, paddingTop: 60, paddingBottom: 60 },
  terugKnop: { marginBottom: 24 },
  terugTekst: { color: '#C9A84C', fontSize: 15, fontWeight: '600' },
  titel: { color: '#ffffff', fontSize: 28, fontWeight: '900', marginBottom: 6 },
  ondertitel: { color: '#4CAF50', fontSize: 14, marginBottom: 32 },
  rij: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  invoerGroep: { marginBottom: 16 },
  label: { color: '#888', fontSize: 13, fontWeight: '600', marginBottom: 6, letterSpacing: 0.5 },
  verplicht: { color: '#FF6B00' },
  invoer: { backgroundColor: '#242424', borderWidth: 1, borderColor: '#333', borderRadius: 12, padding: 14, color: '#ffffff', fontSize: 15 },
  wachtwoordRij: { flexDirection: 'row', backgroundColor: '#242424', borderWidth: 1, borderColor: '#333', borderRadius: 12, alignItems: 'center' },
  wachtwoordInvoer: { flex: 1, padding: 14, color: '#ffffff', fontSize: 15 },
  oogKnop: { padding: 14 },
  oogIcoon: { fontSize: 18 },
  sterkteContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  sterkteBalk: { flex: 1, flexDirection: 'row', gap: 4 },
  sterkteSegment: { flex: 1, height: 4, borderRadius: 2 },
  sterkteLabel: { fontSize: 12, fontWeight: '700', width: 70, textAlign: 'right' },
  criteriaLijst: { marginTop: 8, gap: 3 },
  criterium: { fontSize: 12 },
  akkoordRij: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: 12 },
  selectievakje: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#444', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  selectievakjeActief: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  vinkje: { color: '#ffffff', fontSize: 13, fontWeight: '800' },
  akkoordTekst: { flex: 1, color: '#888', fontSize: 13, lineHeight: 20 },
  link: { color: '#C9A84C', fontWeight: '600' },
  toestemmingKaart: { backgroundColor: '#1e2d1e', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#2d4a2d', marginBottom: 16 },
  toestemmingTekst: { color: '#4CAF50', fontSize: 12 },
  registrerenKnop: { backgroundColor: '#FF6B00', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginBottom: 16, shadowColor: '#FF6B00', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 },
  registrerenTekst: { color: '#1A1A1A', fontSize: 16, fontWeight: '900' },
  inloggenLink: { alignItems: 'center' },
  inloggenTekst: { color: '#666', fontSize: 14 },
  scheidingslijn: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  scheidingslijnLijn: { flex: 1, height: 1, backgroundColor: '#333' },
  scheidingslijnTekst: { color: '#555', fontSize: 13, marginHorizontal: 12 },
  appleKnop: { height: 52, marginBottom: 16 },
  googleKnop: { width: '100%', height: 52, marginBottom: 16 },
});