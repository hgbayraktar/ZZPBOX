import { auth, db } from '@/constants/firebase';
import { useRouter } from 'expo-router';
import { doc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';

type AbonnementSoort = 'maand' | 'kwartaal' | 'jaar';

const PAKKET_STIJL = {
  maand: { label: 'Maandelijks', besparing: null, populair: false, kleur: '#888' },
  kwartaal: { label: 'Per kwartaal', besparing: '13% korting', populair: true, kleur: '#C9A84C' },
  jaar: { label: 'Jaarlijks', besparing: '17% korting', populair: false, kleur: '#4CAF50' },
};

const PREMIUM_VOORDELEN = [
  { icoon: '♾️', tekst: 'Onbeperkt inkomsten & uitgaven invoeren' },
  { icoon: '👥', tekst: 'Onbeperkt klanten beheren' },
  { icoon: '📦', tekst: 'Onbeperkt producten & diensten' },
  { icoon: '📄', tekst: 'Facturen aanmaken & versturen' },
  { icoon: '📤', tekst: 'PDF delen via WhatsApp & e-mail' },
  { icoon: '🖼️', tekst: 'Bedrijfslogo op facturen' },
  { icoon: '📊', tekst: 'Uitgebreide rapporten (jaar/kwartaal/maand)' },
  { icoon: '🚫', tekst: 'Geen advertenties' },
];

export default function AbonnementScherm() {
  const router = useRouter();
  const [geselecteerd, setGeselecteerd] = useState<AbonnementSoort>('kwartaal');
  const [pakketten, setPakketten] = useState<Record<AbonnementSoort, PurchasesPackage | null>>({
    maand: null,
    kwartaal: null,
    jaar: null,
  });
  const [laden, setLaden] = useState(true);
  const [kopen, setKopen] = useState(false);

  useEffect(() => {
    laadPakketten();
  }, []);

  async function laadPakketten() {
    try {
      const aanbiedingen = await Purchases.getOfferings();
      if (aanbiedingen.current) {
        const nieuwePakketten: Record<AbonnementSoort, PurchasesPackage | null> = {
          maand: null,
          kwartaal: null,
          jaar: null,
        };
        for (const pakket of aanbiedingen.current.availablePackages) {
          const id = pakket.identifier;
          if (id === '$rc_monthly') nieuwePakketten.maand = pakket;
          else if (id === '$rc_three_month') nieuwePakketten.kwartaal = pakket;
          else if (id === '$rc_annual') nieuwePakketten.jaar = pakket;
        }
        setPakketten(nieuwePakketten);
      }
    } catch (e) {
      console.error('Fout bij laden pakketten:', e);
    } finally {
      setLaden(false);
    }
  }

  function getPrijs(soort: AbonnementSoort): string {
    const pakket = pakketten[soort];
    if (!pakket) return '...';
    return pakket.product.priceString;
  }

  function getMaandPrijs(soort: AbonnementSoort): string {
    const pakket = pakketten[soort];
    if (!pakket) return '...';
    const prijs = pakket.product.price;
    if (soort === 'kwartaal') return `€ ${(prijs / 3).toFixed(2).replace('.', ',')} /maand`;
    if (soort === 'jaar') return `€ ${(prijs / 12).toFixed(2).replace('.', ',')} /maand`;
    return '';
  }

  async function abonnemenNemen() {
    const pakket = pakketten[geselecteerd];
    if (!pakket) {
      Alert.alert('Fout', 'Pakket niet beschikbaar.');
      return;
    }
    try {
      setKopen(true);
      await Purchases.purchasePackage(pakket);
      const gebruiker = auth.currentUser;
      if (gebruiker) {
        await setDoc(doc(db, 'gebruikers', gebruiker.uid), { pakket: 'premium' }, { merge: true });
      }
      Alert.alert('✅ Gelukt!', 'U heeft nu Premium toegang!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (e: any) {
      if (!e.userCancelled) {
        Alert.alert('Fout', 'Er is iets misgegaan bij de betaling.');
      }
    } finally {
      setKopen(false);
    }
  }

  return (
    <View style={stijlen.scherm}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />

      <View style={stijlen.koptekst}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={stijlen.terugTekst}>← Terug</Text>
        </TouchableOpacity>
        <Text style={stijlen.koptekstTitel}>Premium upgraden</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={stijlen.scrollInhoud}>

        <View style={stijlen.headerKaart}>
          <Text style={stijlen.headerIcoon}>⚡</Text>
          <Text style={stijlen.headerTitel}>ZZPBox Premium</Text>
          <Text style={stijlen.headerOndertitel}>
            Alles wat u nodig heeft voor professioneel boekhouden
          </Text>
        </View>

        <View style={stijlen.voordelenKaart}>
          <Text style={stijlen.voordelenTitel}>Wat krijgt u met Premium?</Text>
          {PREMIUM_VOORDELEN.map((voordeel, index) => (
            <View key={index} style={stijlen.voordeelRij}>
              <Text style={stijlen.voordeelIcoon}>{voordeel.icoon}</Text>
              <Text style={stijlen.voordeelTekst}>{voordeel.tekst}</Text>
            </View>
          ))}
        </View>

        <Text style={stijlen.sectieTitel}>Kies uw abonnement</Text>

        {laden ? (
          <ActivityIndicator color="#C9A84C" size="large" style={{ marginVertical: 32 }} />
        ) : (
          (Object.keys(PAKKET_STIJL) as AbonnementSoort[]).map(soort => {
            const stijl = PAKKET_STIJL[soort];
            const isActief = geselecteerd === soort;
            const prijs = getPrijs(soort);
            const maandPrijs = getMaandPrijs(soort);
            return (
              <TouchableOpacity
                key={soort}
                style={[
                  stijlen.prijsKaart,
                  isActief && { borderColor: stijl.kleur, borderWidth: 2 },
                  stijl.populair && stijlen.populaireKaart,
                ]}
                onPress={() => setGeselecteerd(soort)}
                activeOpacity={0.8}>

                {stijl.populair && (
                  <View style={stijlen.populairBadge}>
                    <Text style={stijlen.populairBadgeTekst}>⭐ MEEST GEKOZEN</Text>
                  </View>
                )}

                <View style={stijlen.prijsKaartInhoud}>
                  <View style={stijlen.prijsLinks}>
                    <View style={[stijlen.radioKnop, isActief && { borderColor: stijl.kleur }]}>
                      {isActief && <View style={[stijlen.radioVulling, { backgroundColor: stijl.kleur }]} />}
                    </View>
                    <View>
                      <Text style={stijlen.prijsLabel}>{stijl.label}</Text>
                      {stijl.besparing && (
                        <View style={[stijlen.besparingBadge, { backgroundColor: stijl.kleur + '22', borderColor: stijl.kleur }]}>
                          <Text style={[stijlen.besparingTekst, { color: stijl.kleur }]}>
                            {stijl.besparing}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={stijlen.prijsRechts}>
                    <Text style={[stijlen.prijsHoofd, isActief && { color: stijl.kleur }]}>
                      {prijs}
                    </Text>
                    {maandPrijs ? (
                      <Text style={stijlen.prijsPeriode}>{maandPrijs}</Text>
                    ) : (
                      <Text style={stijlen.prijsPeriode}>per maand</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={stijlen.samenvattingKaart}>
          <Text style={stijlen.samenvattingTitel}>Uw keuze:</Text>
          <View style={stijlen.samenvattingRij}>
            <Text style={stijlen.samenvattingLabel}>
              Premium {PAKKET_STIJL[geselecteerd].label.toLowerCase()}
            </Text>
            <Text style={stijlen.samenvattingBedrag}>
              {getPrijs(geselecteerd)}
            </Text>
          </View>
          {geselecteerd !== 'maand' && (
            <Text style={stijlen.samenvattingOndertekst}>
              {getMaandPrijs(geselecteerd)}
            </Text>
          )}
          {PAKKET_STIJL[geselecteerd].besparing && (
            <Text style={stijlen.samenvattingBesparing}>
              ✓ U bespaart {PAKKET_STIJL[geselecteerd].besparing}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[stijlen.upgradeKnop, kopen && { opacity: 0.7 }]}
          onPress={abonnemenNemen}
          disabled={kopen}
          activeOpacity={0.8}>
          {kopen ? (
            <ActivityIndicator color="#1A1A1A" />
          ) : (
            <Text style={stijlen.upgradeKnopTekst}>⚡ Nu upgraden naar Premium</Text>
          )}
        </TouchableOpacity>

        <View style={stijlen.garantieKaart}>
          <Text style={stijlen.garantieIcoon}>🛡️</Text>
          <View style={stijlen.garantieTekstBlok}>
            <Text style={stijlen.garantieTitel}>14 dagen herroepingsrecht</Text>
            <Text style={stijlen.garantieOndertekst}>
              Niet tevreden? Annuleer binnen 14 dagen voor volledige terugbetaling. Conform de Nederlandse wet.
            </Text>
          </View>
        </View>

        <Text style={stijlen.sectieTitel}>Gratis vs Premium</Text>
        <View style={stijlen.vergelijkingKaart}>
          <View style={stijlen.vergelijkingHeader}>
            <Text style={[stijlen.vergelijkingKolom, { flex: 2 }]}>Functie</Text>
            <Text style={stijlen.vergelijkingKolom}>Gratis</Text>
            <Text style={stijlen.vergelijkingKolom}>Premium</Text>
          </View>
          {[
            { functie: 'Invoeren per dag', gratis: '3', premium: '∞' },
            { functie: 'Invoeren per maand', gratis: '20', premium: '∞' },
            { functie: 'Klanten', gratis: '3', premium: '∞' },
            { functie: 'Producten/diensten', gratis: '5', premium: '∞' },
            { functie: 'Facturen', gratis: '✗', premium: '✓' },
            { functie: 'PDF delen', gratis: '✗', premium: '✓' },
            { functie: 'Logo op factuur', gratis: '✗', premium: '✓' },
            { functie: 'Rapporten', gratis: '✓', premium: '✓' },
            { functie: 'Advertenties', gratis: '✓', premium: '✗' },
          ].map((rij, index) => (
            <View key={index} style={[stijlen.vergelijkingRij, index % 2 === 0 && stijlen.vergelijkingRijAlt]}>
              <Text style={[stijlen.vergelijkingTekst, { flex: 2 }]}>{rij.functie}</Text>
              <Text style={[stijlen.vergelijkingTekst, {
                color: rij.gratis === '✗' ? '#f44336' : rij.gratis === '✓' ? '#4CAF50' : '#888'
              }]}>{rij.gratis}</Text>
              <Text style={[stijlen.vergelijkingTekst, {
                color: rij.premium === '✗' ? '#f44336' : '#4CAF50'
              }]}>{rij.premium}</Text>
            </View>
          ))}
        </View>

        <View style={stijlen.annuleringKaart}>
          <Text style={stijlen.annuleringTitel}>ℹ️ Annulering & betalingen</Text>
          <Text style={stijlen.annuleringTekst}>
            • Betalingen verlopen via App Store (iOS) of Google Play (Android){'\n'}
            • U kunt op elk moment opzeggen via uw App Store account{'\n'}
            • Bij opzegging blijft Premium actief tot einde van de betaalde periode{'\n'}
            • Automatische verlenging tenzij 24 uur voor afloop opgezegd{'\n'}
            • Vragen? support@zzpbox.nl
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const stijlen = StyleSheet.create({
  scherm: { flex: 1, backgroundColor: '#1A1A1A' },
  koptekst: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  terugTekst: { color: '#C9A84C', fontSize: 15, fontWeight: '600', width: 60 },
  koptekstTitel: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  scrollInhoud: { padding: 20, paddingBottom: 60 },
  headerKaart: { alignItems: 'center', paddingVertical: 32, marginBottom: 24, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  headerIcoon: { fontSize: 48, marginBottom: 12 },
  headerTitel: { color: '#ffffff', fontSize: 28, fontWeight: '900', letterSpacing: 1, marginBottom: 8 },
  headerOndertitel: { color: '#666', fontSize: 14, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },
  voordelenKaart: { backgroundColor: '#242424', borderRadius: 16, padding: 18, marginBottom: 24, borderWidth: 1, borderColor: '#2a2a2a', gap: 12 },
  voordelenTitel: { color: '#C9A84C', fontSize: 14, fontWeight: '800', letterSpacing: 0.5, marginBottom: 4 },
  voordeelRij: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  voordeelIcoon: { fontSize: 18, width: 28 },
  voordeelTekst: { color: '#aaa', fontSize: 13, flex: 1, lineHeight: 20 },
  sectieTitel: { color: '#888', fontSize: 12, fontWeight: '700', letterSpacing: 1.5, marginBottom: 14 },
  prijsKaart: { backgroundColor: '#242424', borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2a2a2a', overflow: 'hidden' },
  populaireKaart: { borderColor: '#C9A84C' },
  populairBadge: { backgroundColor: '#C9A84C', paddingVertical: 6, alignItems: 'center' },
  populairBadgeTekst: { color: '#1A1A1A', fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },
  prijsKaartInhoud: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18 },
  prijsLinks: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  radioKnop: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#444', alignItems: 'center', justifyContent: 'center' },
  radioVulling: { width: 10, height: 10, borderRadius: 5 },
  prijsLabel: { color: '#ffffff', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  besparingBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1, alignSelf: 'flex-start' },
  besparingTekst: { fontSize: 11, fontWeight: '700' },
  prijsRechts: { alignItems: 'flex-end' },
  prijsHoofd: { color: '#ffffff', fontSize: 22, fontWeight: '900' },
  prijsPeriode: { color: '#555', fontSize: 11, marginTop: 2 },
  samenvattingKaart: { backgroundColor: '#1a1a2e', borderRadius: 14, padding: 16, marginTop: 4, marginBottom: 16, borderWidth: 1, borderColor: '#003DA5', gap: 6 },
  samenvattingTitel: { color: '#003DA5', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  samenvattingRij: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  samenvattingLabel: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  samenvattingBedrag: { color: '#C9A84C', fontSize: 16, fontWeight: '800' },
  samenvattingOndertekst: { color: '#666', fontSize: 12 },
  samenvattingBesparing: { color: '#4CAF50', fontSize: 12, fontWeight: '600' },
  upgradeKnop: { backgroundColor: '#FF6B00', paddingVertical: 18, borderRadius: 14, alignItems: 'center', marginBottom: 16, shadowColor: '#FF6B00', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 10 },
  upgradeKnopTekst: { color: '#1A1A1A', fontSize: 17, fontWeight: '900', letterSpacing: 1 },
  garantieKaart: { flexDirection: 'row', backgroundColor: '#1e2d1e', borderRadius: 14, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#2d4a2d', gap: 12, alignItems: 'flex-start' },
  garantieIcoon: { fontSize: 28 },
  garantieTekstBlok: { flex: 1 },
  garantieTitel: { color: '#4CAF50', fontSize: 14, fontWeight: '700', marginBottom: 4 },
  garantieOndertekst: { color: '#666', fontSize: 12, lineHeight: 18 },
  vergelijkingKaart: { backgroundColor: '#242424', borderRadius: 16, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: '#2a2a2a' },
  vergelijkingHeader: { flexDirection: 'row', backgroundColor: '#1a1a1a', padding: 12, borderBottomWidth: 1, borderBottomColor: '#333' },
  vergelijkingKolom: { width: 70, color: '#888', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  vergelijkingRij: { flexDirection: 'row', padding: 12, alignItems: 'center' },
  vergelijkingRijAlt: { backgroundColor: '#1f1f1f' },
  vergelijkingTekst: { width: 70, color: '#aaa', fontSize: 13, textAlign: 'center' },
  annuleringKaart: { backgroundColor: '#242424', borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#2a2a2a' },
  annuleringTitel: { color: '#888', fontSize: 13, fontWeight: '700', marginBottom: 10 },
  annuleringTekst: { color: '#555', fontSize: 12, lineHeight: 22 },
});