import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet, Text,
  TouchableOpacity,
  View
} from 'react-native';
import { gebruikGebruiker, gebruikPakket, gebruikTransacties } from '../../hooks/gebruikData';

export default function DashboardScherm() {
  const router = useRouter();
  const { gebruiker } = gebruikGebruiker();
  const pakket = gebruikPakket();
  const { transacties, laden } = gebruikTransacties();

  const nu = new Date();
  const dezeMaand = nu.toISOString().slice(0, 7);
  const vandaag = nu.toISOString().split('T')[0];

  const maandTransacties = transacties.filter(t => t.aangemaaktOp?.startsWith(dezeMaand));
  const dagTransacties = transacties.filter(t => t.aangemaaktOp?.startsWith(vandaag));

  const maandInkomsten = maandTransacties
    .filter(t => t.soort === 'inkomst')
    .reduce((s, t) => s + parseFloat(t.bedrag || '0'), 0);

  const maandUitgaven = maandTransacties
    .filter(t => t.soort === 'uitgave')
    .reduce((s, t) => s + parseFloat(t.bedrag || '0'), 0);

  const maandResultaat = maandInkomsten - maandUitgaven;

  const maandBtw = maandTransacties
    .filter(t => t.soort === 'inkomst')
    .reduce((s, t) => s + parseFloat(t.btwBedrag || '0'), 0);

  const recenteTransacties = [...transacties]
    .sort((a, b) => b.aangemaaktOp?.localeCompare(a.aangemaaktOp))
    .slice(0, 5);

  const dagLimiet = 3;
  const maandLimiet = 20;

  function euro(b: number) {
    return `€ ${b.toFixed(2).replace('.', ',')}`;
  }

  function begroeting() {
    const uur = nu.getHours();
    if (uur < 12) return 'Goedemorgen 🌅';
    if (uur < 18) return 'Goedemiddag ☀️';
    return 'Goedenavond 🌙';
  }

  const voornaam = gebruiker?.displayName?.split(' ')[0] || 'ZZP\'er';

  return (
    <View style={stijlen.scherm}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />

      <ScrollView
        contentContainerStyle={[
          stijlen.scrollInhoud,
          { paddingBottom: pakket === 'gratis' ? 180 : 130 }
        ]}>

        <View style={stijlen.koptekst}>
          <View>
            <Text style={stijlen.begroeting}>{begroeting()}</Text>
            <Text style={stijlen.naam}>{voornaam} 👋</Text>
          </View>
          <View style={[stijlen.pakketBadge, pakket === 'premium' && stijlen.pakketBadgePremium]}>
            <Text style={stijlen.pakketTekst}>{pakket === 'premium' ? '⭐ PREMIUM' : 'GRATIS'}</Text>
          </View>
        </View>

        <View style={stijlen.overzichtKaart}>
          <Text style={stijlen.overzichtTitel}>
            {nu.toLocaleString('nl-NL', { month: 'long', year: 'numeric' })}
          </Text>
          {laden ? (
            <ActivityIndicator color="#C9A84C" />
          ) : (
            <>
              <View style={stijlen.overzichtRij}>
                <View style={stijlen.overzichtItem}>
                  <Text style={stijlen.overzichtLabel}>Inkomsten</Text>
                  <Text style={stijlen.bedragGroen}>{euro(maandInkomsten)}</Text>
                </View>
                <View style={stijlen.verticaleLijn} />
                <View style={stijlen.overzichtItem}>
                  <Text style={stijlen.overzichtLabel}>Uitgaven</Text>
                  <Text style={stijlen.bedragRood}>{euro(maandUitgaven)}</Text>
                </View>
                <View style={stijlen.verticaleLijn} />
                <View style={stijlen.overzichtItem}>
                  <Text style={stijlen.overzichtLabel}>Resultaat</Text>
                  <Text style={[stijlen.bedragGoud, { color: maandResultaat >= 0 ? '#C9A84C' : '#f44336' }]}>
                    {euro(maandResultaat)}
                  </Text>
                </View>
              </View>
              <View style={stijlen.btwRij}>
                <Text style={stijlen.btwLabel}>🧾 BTW af te dragen</Text>
                <Text style={stijlen.btwBedrag}>{euro(maandBtw)}</Text>
              </View>
            </>
          )}
        </View>

        <Text style={stijlen.sectieTitel}>Snelle acties</Text>
        <View style={stijlen.actiesRooster}>
          <TouchableOpacity
            style={stijlen.actieKaart}
            onPress={() => router.push('/(tabs)/inkomsten')}
            activeOpacity={0.8}>
            <Text style={stijlen.actieIcoon}>💰</Text>
            <Text style={stijlen.actieTekst}>Inkomst{'\n'}toevoegen</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={stijlen.actieKaart}
            onPress={() => router.push('/(tabs)/inkomsten?soort=uitgave')}
            activeOpacity={0.8}>
            <Text style={stijlen.actieIcoon}>🧾</Text>
            <Text style={stijlen.actieTekst}>Uitgave{'\n'}toevoegen</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[stijlen.actieKaart, pakket === 'gratis' && stijlen.actieKaartGesloten]}
            onPress={() => pakket === 'premium'
              ? router.push('/(tabs)/facturen')
              : router.push('/(tabs)/abonnement')}
            activeOpacity={0.8}>
            <Text style={stijlen.actieIcoon}>📄</Text>
            <Text style={stijlen.actieTekst}>Factuur{'\n'}aanmaken</Text>
            {pakket === 'gratis' && <Text style={stijlen.slotIcoon}>🔒</Text>}
          </TouchableOpacity>
          <TouchableOpacity
            style={stijlen.actieKaart}
            onPress={() => router.push('/(tabs)/rapportage?from=dashboard')}
            activeOpacity={0.8}>
            <Text style={stijlen.actieIcoon}>📊</Text>
            <Text style={stijlen.actieTekst}>Rapport{'\n'}bekijken</Text>
          </TouchableOpacity>
        </View>

        <Text style={stijlen.sectieTitel}>Recente transacties</Text>
        {laden ? (
          <ActivityIndicator color="#C9A84C" style={{ marginTop: 20 }} />
        ) : recenteTransacties.length === 0 ? (
          <View style={stijlen.legeKaart}>
            <Text style={stijlen.leegIcoon}>📭</Text>
            <Text style={stijlen.leegeTekst}>Nog geen transacties</Text>
            <Text style={stijlen.leegeOndertekst}>Voeg uw eerste inkomst of uitgave toe</Text>
          </View>
        ) : (
          recenteTransacties.map(t => (
            <View key={t.id} style={stijlen.transactieKaart}>
              <View style={[stijlen.transactieBalk, {
                backgroundColor: t.soort === 'inkomst' ? '#4CAF50' : '#f44336'
              }]} />
              <View style={stijlen.transactieInhoud}>
                <View style={{ flex: 1 }}>
                  <Text style={stijlen.transactieOmschrijving}>{t.omschrijving}</Text>
                  <Text style={stijlen.transactieMeta}>{t.datum} · {t.categorie || 'Geen categorie'}</Text>
                </View>
                <Text style={[stijlen.transactieBedrag, {
                  color: t.soort === 'inkomst' ? '#4CAF50' : '#f44336'
                }]}>
                  {t.soort === 'inkomst' ? '+' : '-'}{euro(parseFloat(t.bedrag))}
                </Text>
              </View>
            </View>
          ))
        )}

        {pakket === 'gratis' && (
          <View style={stijlen.limietKaart}>
            <View style={stijlen.limietKoptekst}>
              <Text style={stijlen.limietTitel}>Dagelijks gebruik</Text>
              <Text style={stijlen.limietBadge}>GRATIS</Text>
            </View>
            <Text style={stijlen.limietTekst}>{dagTransacties.length} / {dagLimiet} invoeren vandaag</Text>
            <View style={stijlen.limietBalk}>
              <View style={[stijlen.limietVoortgang, {
                width: `${Math.min((dagTransacties.length / dagLimiet) * 100, 100)}%`
              }]} />
            </View>
            <Text style={stijlen.limietTekst}>{maandTransacties.length} / {maandLimiet} invoeren deze maand</Text>
            <View style={stijlen.limietBalk}>
              <View style={[stijlen.limietVoortgang, {
                width: `${Math.min((maandTransacties.length / maandLimiet) * 100, 100)}%`
              }]} />
            </View>
            <TouchableOpacity
              style={stijlen.upgradeKnop}
              onPress={() => router.push('/(tabs)/abonnement')}>
              <Text style={stijlen.upgradeKnopTekst}>⚡ Upgraden naar Premium — vanaf €9,99/maand</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      {pakket === 'gratis' && (
        <View style={stijlen.reclameBanner}>
          <View style={stijlen.reclameInhoud}>
            <Text style={stijlen.reclameLabel}>ADVERTENTIE</Text>
            <Text style={stijlen.reclameTekst}>📢 Hier komt uw advertentie</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/abonnement')}>
              <Text style={stijlen.reclameUpgrade}>Reclamevrij? Upgrade →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={stijlen.ondersteNavigatie}>
        <TouchableOpacity style={stijlen.navigatieItem} onPress={() => router.push('/(tabs)/dashboard')}>
          <Text style={stijlen.navigatieIcoonActief}>🏠</Text>
          <Text style={stijlen.navigatieLabelActief}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={stijlen.navigatieItem} onPress={() => router.push('/(tabs)/inkomsten')}>
          <Text style={stijlen.navigatieIcoon}>💰</Text>
          <Text style={stijlen.navigatieLabel}>Transacties</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={stijlen.navigatieItem}
          onPress={() => pakket === 'premium'
            ? router.push('/(tabs)/facturen')
            : router.push('/(tabs)/abonnement')}>
          <Text style={stijlen.navigatieIcoon}>📄</Text>
          <Text style={stijlen.navigatieLabel}>Facturen</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={stijlen.navigatieItem}
          onPress={() => router.push('/(tabs)/rapportage?from=dashboard')}>
          <Text style={stijlen.navigatieIcoon}>📊</Text>
          <Text style={stijlen.navigatieLabel}>Rapporten</Text>
        </TouchableOpacity>
        <TouchableOpacity style={stijlen.navigatieItem} onPress={() => router.push('/(tabs)/instellingen')}>
          <Text style={stijlen.navigatieIcoon}>⚙️</Text>
          <Text style={stijlen.navigatieLabel}>Instellingen</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const stijlen = StyleSheet.create({
  scherm: { flex: 1, backgroundColor: '#1A1A1A' },
  scrollInhoud: { padding: 24, paddingTop: 60 },
  koptekst: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  begroeting: { color: '#666', fontSize: 14 },
  naam: { color: '#ffffff', fontSize: 22, fontWeight: '800' },
  pakketBadge: { backgroundColor: '#242424', borderWidth: 1, borderColor: '#333', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  pakketBadgePremium: { backgroundColor: '#1e1a0e', borderColor: '#C9A84C' },
  pakketTekst: { color: '#C9A84C', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  overzichtKaart: { backgroundColor: '#242424', borderRadius: 18, padding: 20, marginBottom: 28, borderWidth: 1, borderColor: '#2a2a2a' },
  overzichtTitel: { color: '#666', fontSize: 12, fontWeight: '600', letterSpacing: 1, marginBottom: 16, textTransform: 'capitalize' },
  overzichtRij: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  overzichtItem: { flex: 1, alignItems: 'center' },
  overzichtLabel: { color: '#666', fontSize: 11, marginBottom: 6 },
  bedragGroen: { color: '#4CAF50', fontSize: 16, fontWeight: '800' },
  bedragRood: { color: '#f44336', fontSize: 16, fontWeight: '800' },
  bedragGoud: { fontSize: 16, fontWeight: '800' },
  verticaleLijn: { width: 1, backgroundColor: '#333' },
  btwRij: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTopWidth: 1, borderTopColor: '#333' },
  btwLabel: { color: '#666', fontSize: 13 },
  btwBedrag: { color: '#FF6B00', fontSize: 14, fontWeight: '700' },
  sectieTitel: { color: '#888', fontSize: 12, fontWeight: '700', letterSpacing: 1.5, marginBottom: 14 },
  actiesRooster: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  actieKaart: { backgroundColor: '#242424', borderRadius: 16, padding: 18, width: '47%', borderWidth: 1, borderColor: '#2a2a2a', alignItems: 'center', gap: 8 },
  actieKaartGesloten: { opacity: 0.5 },
  actieIcoon: { fontSize: 28 },
  actieTekst: { color: '#ffffff', fontSize: 13, fontWeight: '600', textAlign: 'center', lineHeight: 18 },
  slotIcoon: { fontSize: 14, position: 'absolute', top: 8, right: 8 },
  legeKaart: { backgroundColor: '#242424', borderRadius: 16, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: '#2a2a2a', marginBottom: 20, gap: 8 },
  leegIcoon: { fontSize: 36 },
  leegeTekst: { color: '#666', fontSize: 15, fontWeight: '600' },
  leegeOndertekst: { color: '#444', fontSize: 13, textAlign: 'center' },
  transactieKaart: { flexDirection: 'row', backgroundColor: '#242424', borderRadius: 12, marginBottom: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#2a2a2a' },
  transactieBalk: { width: 4 },
  transactieInhoud: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', padding: 12, alignItems: 'center' },
  transactieOmschrijving: { color: '#ffffff', fontSize: 13, fontWeight: '600', marginBottom: 2 },
  transactieMeta: { color: '#555', fontSize: 11 },
  transactieBedrag: { fontSize: 14, fontWeight: '800' },
  limietKaart: { backgroundColor: '#1e1a0e', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#3a2e0a', gap: 10, marginTop: 8 },
  limietKoptekst: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  limietTitel: { color: '#C9A84C', fontSize: 14, fontWeight: '700' },
  limietBadge: { color: '#C9A84C', fontSize: 11, fontWeight: '800' },
  limietTekst: { color: '#888', fontSize: 13 },
  limietBalk: { height: 6, backgroundColor: '#333', borderRadius: 3, overflow: 'hidden' },
  limietVoortgang: { height: 6, backgroundColor: '#C9A84C', borderRadius: 3 },
  upgradeKnop: { backgroundColor: '#FF6B00', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  upgradeKnopTekst: { color: '#1A1A1A', fontSize: 13, fontWeight: '800' },
  reclameBanner: { position: 'absolute', bottom: 70, left: 0, right: 0, height: 56, backgroundColor: '#111111', borderTopWidth: 1, borderTopColor: '#333', borderBottomWidth: 1, borderBottomColor: '#333', justifyContent: 'center' },
  reclameInhoud: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  reclameLabel: { color: '#444', fontSize: 9, fontWeight: '800', letterSpacing: 1.5, position: 'absolute', top: -18, left: 16 },
  reclameTekst: { color: '#888', fontSize: 13, fontWeight: '500' },
  reclameUpgrade: { color: '#C9A84C', fontSize: 11, fontWeight: '700' },
  ondersteNavigatie: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#242424', flexDirection: 'row', paddingBottom: 28, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#333' },
  navigatieItem: { flex: 1, alignItems: 'center', gap: 4 },
  navigatieIcoon: { fontSize: 22 },
  navigatieIcoonActief: { fontSize: 22 },
  navigatieLabel: { color: '#555', fontSize: 10, fontWeight: '600' },
  navigatieLabelActief: { color: '#FF6B00', fontSize: 10, fontWeight: '800' },
});