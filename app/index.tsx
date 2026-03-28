import { useRouter } from 'expo-router';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WelkomScherm() {
  const router = useRouter();

  return (
    <View style={stijlen.scherm}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />

      <View style={stijlen.achtergrondCirkel1} />
      <View style={stijlen.achtergrondCirkel2} />

      <View style={stijlen.logoWrapper}>
        <View style={stijlen.logoRij}>
          <View style={stijlen.logoKader}>
            <View style={stijlen.grafiek}>
              <View style={[stijlen.balk, stijlen.balk1]} />
              <View style={[stijlen.balk, stijlen.balk2]} />
              <View style={[stijlen.balk, stijlen.balk3]} />
              <View style={[stijlen.balk, stijlen.balk4]} />
            </View>
          </View>
          <View style={stijlen.tekstBlok}>
            <Text style={stijlen.zzpTekst}>ZZP</Text>
            <Text style={stijlen.boxTekst}>B O X</Text>
            <View style={stijlen.gradientLijn}>
              <View style={[stijlen.lijnSegment, { backgroundColor: '#003DA5', flex: 1 }]} />
              <View style={[stijlen.lijnSegment, { backgroundColor: '#C9A84C', flex: 1 }]} />
              <View style={[stijlen.lijnSegment, { backgroundColor: '#FF6B00', flex: 1 }]} />
            </View>
          </View>
        </View>
        <Text style={stijlen.slogan}>Slim boekhouden voor de zelfstandige</Text>
      </View>

      <View style={stijlen.scheidingslijn} />

      <View style={stijlen.knoppen}>
        <TouchableOpacity
          style={stijlen.hoofdKnop}
          onPress={() => router.push('/inloggen')}
          activeOpacity={0.8}>
          <Text style={stijlen.hoofdKnopTekst}>Inloggen</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={stijlen.secundaireKnop}
          onPress={() => router.push('/registreren')}
          activeOpacity={0.8}>
          <Text style={stijlen.secundaireKnopTekst}>Registreren</Text>
        </TouchableOpacity>
      </View>

      <Text style={stijlen.voettekst}>🇳🇱 Gemaakt voor Nederlandse ZZP'ers</Text>
    </View>
  );
}

const stijlen = StyleSheet.create({
  scherm: {
    flex: 1, backgroundColor: '#1A1A1A',
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  achtergrondCirkel1: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: '#003DA5', opacity: 0.06, top: -80, right: -80,
  },
  achtergrondCirkel2: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: '#FF6B00', opacity: 0.06, bottom: 60, left: -60,
  },
  logoWrapper: { alignItems: 'center', marginBottom: 60 },
  logoRij: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  logoKader: {
    width: 64, height: 64, borderRadius: 16,
    backgroundColor: '#16213e', borderWidth: 2, borderColor: '#003DA5',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#003DA5', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 12, elevation: 10,
  },
  grafiek: { flexDirection: 'row', alignItems: 'flex-end', gap: 5, height: 34 },
  balk: { width: 8, borderRadius: 3 },
  balk1: { height: 10, backgroundColor: '#C9A84C', opacity: 0.4 },
  balk2: { height: 18, backgroundColor: '#C9A84C', opacity: 0.65 },
  balk3: { height: 26, backgroundColor: '#C9A84C' },
  balk4: { height: 34, backgroundColor: '#FF6B00' },
  tekstBlok: { flexDirection: 'column' },
  zzpTekst: {
    fontSize: 46, fontWeight: '900', color: '#C9A84C',
    letterSpacing: 6, lineHeight: 46,
  },
  boxTekst: {
    fontSize: 13, fontWeight: '700', color: '#FF6B00',
    letterSpacing: 9, marginTop: 2,
  },
  gradientLijn: {
    flexDirection: 'row', height: 2, marginTop: 5,
    borderRadius: 2, overflow: 'hidden',
  },
  lijnSegment: { height: 2 },
  slogan: { color: '#666', fontSize: 12, letterSpacing: 1, textAlign: 'center' },
  scheidingslijn: { width: 40, height: 1, backgroundColor: '#2a2a2a', marginBottom: 40 },
  knoppen: { width: '100%', gap: 14 },
  hoofdKnop: {
    backgroundColor: '#FF6B00', paddingVertical: 18, borderRadius: 14,
    alignItems: 'center', shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4,
    shadowRadius: 12, elevation: 10,
  },
  hoofdKnopTekst: { color: '#1A1A1A', fontSize: 17, fontWeight: '800', letterSpacing: 2 },
  secundaireKnop: {
    borderWidth: 2, borderColor: '#C9A84C',
    paddingVertical: 18, borderRadius: 14, alignItems: 'center',
  },
  secundaireKnopTekst: { color: '#C9A84C', fontSize: 17, fontWeight: '700', letterSpacing: 2 },
  voettekst: { position: 'absolute', bottom: 36, color: '#444', fontSize: 11, letterSpacing: 0.5 },
});