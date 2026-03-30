import * as AppleAuthentication from 'expo-apple-authentication';
import { useRouter } from 'expo-router';
import { OAuthProvider, sendPasswordResetEmail, signInWithCredential, signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
  StyleSheet, Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { auth } from '../constants/firebase';

export default function InloggenScherm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [wachtwoord, setWachtwoord] = useState('');
  const [toonWachtwoord, setToonWachtwoord] = useState(false);
  const [laden, setLaden] = useState(false);

  async function inloggen() {
    if (!email || !wachtwoord) {
      Alert.alert('Verplichte velden', 'Vul uw e-mailadres en wachtwoord in.');
      return;
    }
    setLaden(true);
    try {
      await signInWithEmailAndPassword(auth, email, wachtwoord);
      router.replace('/(tabs)/dashboard');
    } catch (fout: any) {
      let melding = 'Inloggen mislukt. Controleer uw gegevens.';
      if (fout.code === 'auth/user-not-found') melding = 'Geen account gevonden met dit e-mailadres.';
      if (fout.code === 'auth/wrong-password') melding = 'Onjuist wachtwoord.';
      if (fout.code === 'auth/invalid-email') melding = 'Ongeldig e-mailadres.';
      if (fout.code === 'auth/too-many-requests') melding = 'Te veel pogingen. Probeer het later opnieuw.';
      if (fout.code === 'auth/invalid-credential') melding = 'Onjuist e-mailadres of wachtwoord.';
      Alert.alert('Fout', melding);
    } finally {
      setLaden(false);
    }
  }

  async function appleInloggen() {
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
      await signInWithCredential(auth, credential);
      router.replace('/(tabs)/dashboard');
    } catch (fout: any) {
      if (fout.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Fout', 'Inloggen met Apple mislukt.');
      }
    }
  }

  async function wachtwoordVergeten() {
    if (!email) {
      Alert.alert('E-mailadres', 'Vul eerst uw e-mailadres in.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('E-mail verstuurd', `Een herstelmail is verstuurd naar ${email}`);
    } catch (fout: any) {
      Alert.alert('Fout', 'Controleer uw e-mailadres en probeer opnieuw.');
    }
  }

  return (
    <View style={stijlen.scherm}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />

      <View style={stijlen.inhoud}>
        <TouchableOpacity onPress={() => router.back()} style={stijlen.terugKnop}>
          <Text style={stijlen.terugTekst}>← Terug</Text>
        </TouchableOpacity>

        <Text style={stijlen.titel}>Inloggen</Text>
        <Text style={stijlen.ondertitel}>Welkom terug bij ZZPBox</Text>

        <View style={stijlen.invoerGroep}>
          <Text style={stijlen.label}>E-mailadres</Text>
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
          <Text style={stijlen.label}>Wachtwoord</Text>
          <View style={stijlen.wachtwoordRij}>
            <TextInput
              style={stijlen.wachtwoordInvoer}
              placeholder="Uw wachtwoord"
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
        </View>

        <TouchableOpacity onPress={wachtwoordVergeten} style={stijlen.vergetenLink}>
          <Text style={stijlen.vergetenTekst}>Wachtwoord vergeten?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[stijlen.inloggenKnop, laden && { opacity: 0.7 }]}
          onPress={inloggen}
          disabled={laden}
          activeOpacity={0.8}>
          {laden ? (
            <ActivityIndicator color="#1A1A1A" />
          ) : (
            <Text style={stijlen.inloggenTekst}>Inloggen →</Text>
          )}
        </TouchableOpacity>

        {Platform.OS === 'ios' && (
          <>
            <View style={stijlen.scheidingslijn}>
              <View style={stijlen.scheidingslijnLijn} />
              <Text style={stijlen.scheidingslijnTekst}>of</Text>
              <View style={stijlen.scheidingslijnLijn} />
            </View>
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
              cornerRadius={14}
              style={stijlen.appleKnop}
              onPress={appleInloggen}
            />
          </>
        )}

        <TouchableOpacity onPress={() => router.push('/registreren')} style={stijlen.registrerenLink}>
          <Text style={stijlen.registrerenTekst}>
            Nog geen account? <Text style={stijlen.link}>Registreren</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const stijlen = StyleSheet.create({
  scherm: { flex: 1, backgroundColor: '#1A1A1A' },
  inhoud: { flex: 1, padding: 24, paddingTop: 60 },
  terugKnop: { marginBottom: 32 },
  terugTekst: { color: '#C9A84C', fontSize: 15, fontWeight: '600' },
  titel: { color: '#ffffff', fontSize: 28, fontWeight: '900', marginBottom: 6 },
  ondertitel: { color: '#666', fontSize: 14, marginBottom: 40 },
  invoerGroep: { marginBottom: 16 },
  label: { color: '#888', fontSize: 13, fontWeight: '600', marginBottom: 6, letterSpacing: 0.5 },
  invoer: { backgroundColor: '#242424', borderWidth: 1, borderColor: '#333', borderRadius: 12, padding: 14, color: '#ffffff', fontSize: 15 },
  wachtwoordRij: { flexDirection: 'row', backgroundColor: '#242424', borderWidth: 1, borderColor: '#333', borderRadius: 12, alignItems: 'center' },
  wachtwoordInvoer: { flex: 1, padding: 14, color: '#ffffff', fontSize: 15 },
  oogKnop: { padding: 14 },
  oogIcoon: { fontSize: 18 },
  vergetenLink: { alignItems: 'flex-end', marginBottom: 24 },
  vergetenTekst: { color: '#C9A84C', fontSize: 13, fontWeight: '600' },
  inloggenKnop: { backgroundColor: '#FF6B00', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginBottom: 16, shadowColor: '#FF6B00', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 },
  inloggenTekst: { color: '#1A1A1A', fontSize: 16, fontWeight: '900' },
  registrerenLink: { alignItems: 'center' },
  registrerenTekst: { color: '#666', fontSize: 14 },
  link: { color: '#C9A84C', fontWeight: '600' },
  scheidingslijn: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  scheidingslijnLijn: { flex: 1, height: 1, backgroundColor: '#333' },
  scheidingslijnTekst: { color: '#555', fontSize: 13, marginHorizontal: 12 },
  appleKnop: { height: 52, marginBottom: 16 },
});
