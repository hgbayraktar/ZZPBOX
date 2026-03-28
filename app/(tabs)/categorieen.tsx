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
import { gebruikCategorieën } from '../../hooks/gebruikData';

const ICOON_OPTIES = [
  '🏠','🚗','👥','📣','🖥️','🏦','📊','🛒','📎',
  '💰','📦','🛠️','💡','🔧','⛽','🚆','🅿️','🎓',
  '📱','🌐','📝','💻','📞','🛡️','⚖️','🏭','🍽️',
  '📋','🎪','🤝','💼','👷','🧹','📮','📈','🎫',
];

export default function CategorieënScherm() {
  const router = useRouter();
  const { categorieën, hoofdCategorieën, subCategorieën, laden, toevoegen, verwijderen } = gebruikCategorieën();

  const [modalZichtbaar, setModalZichtbaar] = useState(false);
  const [bezig, setBezig] = useState(false);
  const [uitgeklapt, setUitgeklapt] = useState<Record<string, boolean>>({});

  const [nieuweNaam, setNieuweNaam] = useState('');
  const [nieuwSoort, setNieuwSoort] = useState<'inkomst' | 'uitgave'>('uitgave');
  const [nieuwIcoon, setNieuwIcoon] = useState('📎');
  const [bovenliggendId, setBovenliggendId] = useState<string | null>(null);
  const [bovenliggendNaam, setBovenliggendNaam] = useState<string>('');

  function toggleUitklappen(id: string) {
    setUitgeklapt(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function nieuweHoofdcategorie(soort: 'inkomst' | 'uitgave') {
    setNieuweNaam('');
    setNieuwSoort(soort);
    setNieuwIcoon('📎');
    setBovenliggendId(null);
    setBovenliggendNaam('');
    setModalZichtbaar(true);
  }

  function nieuweSubcategorie(hoofdId: string, hoofdNaam: string, soort: 'inkomst' | 'uitgave') {
    setNieuweNaam('');
    setNieuwSoort(soort);
    setNieuwIcoon('📎');
    setBovenliggendId(hoofdId);
    setBovenliggendNaam(hoofdNaam);
    setModalZichtbaar(true);
  }

  async function categorieOpslaan() {
    if (!nieuweNaam.trim()) {
      Alert.alert('Verplicht veld', 'Vul een naam in.');
      return;
    }
    setBezig(true);
    try {
      await toevoegen({
        naam: nieuweNaam.trim(),
        soort: nieuwSoort,
        icoon: nieuwIcoon,
        kleur: nieuwSoort === 'inkomst' ? '#4CAF50' : '#FF6B00',
        bovenliggend: bovenliggendId,
        volgorde: 99,
      });
      setModalZichtbaar(false);
    } catch (e) {
      Alert.alert('Fout', 'Kon categorie niet opslaan.');
    } finally {
      setBezig(false);
    }
  }

  function bevestigVerwijderen(id: string, naam: string, heeftKinderen: boolean) {
    const bericht = heeftKinderen
      ? `Weet u zeker dat u "${naam}" en alle subcategorieën wilt verwijderen?`
      : `Weet u zeker dat u "${naam}" wilt verwijderen?`;
    Alert.alert('Verwijderen', bericht, [
      { text: 'Annuleren', style: 'cancel' },
      { text: 'Verwijderen', style: 'destructive', onPress: () => verwijderen(id) }
    ]);
  }

  const inkomstenHoofd = hoofdCategorieën.filter(c => c.soort === 'inkomst');
  const uitgavenHoofd = hoofdCategorieën.filter(c => c.soort === 'uitgave');

  function renderHoofdcategorie(cat: any) {
    const subs = subCategorieën(cat.id);
    const isUitgeklapt = uitgeklapt[cat.id] !== false;

    return (
      <View key={cat.id} style={stijlen.hoofdKaart}>
        <TouchableOpacity
          style={stijlen.hoofdRij}
          onPress={() => toggleUitklappen(cat.id)}
          activeOpacity={0.8}>
          <View style={stijlen.hoofdLinks}>
            <Text style={stijlen.hoofdIcoon}>{cat.icoon}</Text>
            <View>
              <Text style={stijlen.hoofdNaam}>{cat.naam}</Text>
              <Text style={stijlen.subAantal}>{subs.length} subcategorie{subs.length !== 1 ? 'ën' : ''}</Text>
            </View>
          </View>
          <View style={stijlen.hoofdRechts}>
            <TouchableOpacity
              style={stijlen.subToevoegenKnop}
              onPress={() => nieuweSubcategorie(cat.id, cat.naam, cat.soort)}>
              <Text style={stijlen.subToevoegenTekst}>+ Sub</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => bevestigVerwijderen(cat.id, cat.naam, subs.length > 0)}>
              <Text style={stijlen.verwijderIcoon}>🗑️</Text>
            </TouchableOpacity>
            <Text style={stijlen.pijl}>{isUitgeklapt ? '▲' : '▼'}</Text>
          </View>
        </TouchableOpacity>

        {isUitgeklapt && subs.length > 0 && (
          <View style={stijlen.subLijst}>
            {subs.map(sub => (
              <View key={sub.id} style={stijlen.subRij}>
                <Text style={stijlen.subIcoon}>{sub.icoon}</Text>
                <Text style={stijlen.subNaam}>{sub.naam}</Text>
                <TouchableOpacity onPress={() => bevestigVerwijderen(sub.id, sub.naam, false)}>
                  <Text style={stijlen.subVerwijder}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={stijlen.scherm}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />

      <View style={stijlen.koptekst}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/instellingen')}>
  <Text style={stijlen.terugTekst}>← Terug</Text>
</TouchableOpacity>
        <Text style={stijlen.koptekstTitel}>Categorieën</Text>
        <View style={{ width: 60 }} />
      </View>

      {laden ? (
        <ActivityIndicator color="#C9A84C" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={stijlen.scrollInhoud}>

          {/* INKOMSTEN */}
          <View style={stijlen.sectieKoptekstRij}>
            <Text style={stijlen.sectieKoptekst}>💰 Inkomstencategorieën</Text>
            <TouchableOpacity
              style={stijlen.toevoegenKnop}
              onPress={() => nieuweHoofdcategorie('inkomst')}>
              <Text style={stijlen.toevoegenTekst}>+ Nieuw</Text>
            </TouchableOpacity>
          </View>

          {inkomstenHoofd.length === 0 ? (
            <View style={stijlen.legeRij}>
              <Text style={stijlen.leegeTekst}>Geen inkomstencategorieën</Text>
            </View>
          ) : (
            inkomstenHoofd.map(renderHoofdcategorie)
          )}

          {/* UITGAVEN */}
          <View style={[stijlen.sectieKoptekstRij, { marginTop: 24 }]}>
            <Text style={stijlen.sectieKoptekst}>🧾 Uitgavencategorieën</Text>
            <TouchableOpacity
              style={[stijlen.toevoegenKnop, { backgroundColor: '#2d1e0e' }]}
              onPress={() => nieuweHoofdcategorie('uitgave')}>
              <Text style={[stijlen.toevoegenTekst, { color: '#FF6B00' }]}>+ Nieuw</Text>
            </TouchableOpacity>
          </View>

          {uitgavenHoofd.length === 0 ? (
            <View style={stijlen.legeRij}>
              <Text style={stijlen.leegeTekst}>Geen uitgavencategorieën</Text>
            </View>
          ) : (
            uitgavenHoofd.map(renderHoofdcategorie)
          )}

        </ScrollView>
      )}

      {/* MODAL */}
      <Modal visible={modalZichtbaar} animationType="slide" presentationStyle="pageSheet">
        <View style={stijlen.modalScherm}>
          <View style={stijlen.modalKoptekst}>
            <TouchableOpacity onPress={() => setModalZichtbaar(false)}>
              <Text style={stijlen.annulerenTekst}>Annuleren</Text>
            </TouchableOpacity>
            <Text style={stijlen.modalTitel}>
              {bovenliggendId ? `Subcategorie toevoegen` : 'Categorie toevoegen'}
            </Text>
            <TouchableOpacity onPress={categorieOpslaan} disabled={bezig}>
              <Text style={stijlen.opslaanTekst}>{bezig ? '...' : 'Opslaan'}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={stijlen.modalInhoud} keyboardShouldPersistTaps="handled">

            {bovenliggendId && (
              <View style={stijlen.bovenliggendKaart}>
                <Text style={stijlen.bovenliggendLabel}>Hoofdcategorie</Text>
                <Text style={stijlen.bovenliggendNaam}>{bovenliggendNaam}</Text>
              </View>
            )}

            {!bovenliggendId && (
              <View style={stijlen.invoerGroep}>
                <Text style={stijlen.label}>Type</Text>
                <View style={stijlen.soortKnoppen}>
                  <TouchableOpacity
                    style={[stijlen.soortKnop, nieuwSoort === 'inkomst' && stijlen.soortKnopInkomstActief]}
                    onPress={() => setNieuwSoort('inkomst')}>
                    <Text style={[stijlen.soortKnopTekst, nieuwSoort === 'inkomst' && { color: '#4CAF50', fontWeight: '700' }]}>
                      💰 Inkomst
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[stijlen.soortKnop, nieuwSoort === 'uitgave' && stijlen.soortKnopUitgaveActief]}
                    onPress={() => setNieuwSoort('uitgave')}>
                    <Text style={[stijlen.soortKnopTekst, nieuwSoort === 'uitgave' && { color: '#FF6B00', fontWeight: '700' }]}>
                      🧾 Uitgave
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={stijlen.invoerGroep}>
              <Text style={stijlen.label}>Naam <Text style={stijlen.verplicht}>*</Text></Text>
              <TextInput
                style={stijlen.invoer}
                placeholder="Bijv. Huur, Software, Advies..."
                placeholderTextColor="#444"
                value={nieuweNaam}
                onChangeText={setNieuweNaam}
                autoFocus
              />
            </View>

            <View style={stijlen.invoerGroep}>
              <Text style={stijlen.label}>Icoon</Text>
              <View style={stijlen.icoonRooster}>
                {ICOON_OPTIES.map(icoon => (
                  <TouchableOpacity
                    key={icoon}
                    style={[stijlen.icoonOptie, nieuwIcoon === icoon && stijlen.icoonOptieActief]}
                    onPress={() => setNieuwIcoon(icoon)}>
                    <Text style={stijlen.icoonTekst}>{icoon}</Text>
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
  scrollInhoud: { padding: 16, paddingBottom: 60 },
  sectieKoptekstRij: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectieKoptekst: { color: '#C9A84C', fontSize: 14, fontWeight: '800' },
  toevoegenKnop: { backgroundColor: '#1e2d1e', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, borderWidth: 1, borderColor: '#2d4a2d' },
  toevoegenTekst: { color: '#4CAF50', fontSize: 13, fontWeight: '700' },
  legeRij: { backgroundColor: '#242424', borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 8 },
  leegeTekst: { color: '#555', fontSize: 13 },
  hoofdKaart: { backgroundColor: '#242424', borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: '#2a2a2a', overflow: 'hidden' },
  hoofdRij: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  hoofdLinks: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  hoofdIcoon: { fontSize: 24 },
  hoofdNaam: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  subAantal: { color: '#555', fontSize: 11, marginTop: 2 },
  hoofdRechts: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  subToevoegenKnop: { backgroundColor: '#1A1A1A', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  subToevoegenTekst: { color: '#C9A84C', fontSize: 11, fontWeight: '700' },
  verwijderIcoon: { fontSize: 16 },
  pijl: { color: '#555', fontSize: 12 },
  subLijst: { borderTopWidth: 1, borderTopColor: '#2a2a2a' },
  subRij: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#2a2a2a', gap: 10 },
  subIcoon: { fontSize: 18 },
  subNaam: { flex: 1, color: '#aaa', fontSize: 13 },
  subVerwijder: { color: '#444', fontSize: 16 },
  modalScherm: { flex: 1, backgroundColor: '#1A1A1A' },
  modalKoptekst: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  annulerenTekst: { color: '#888', fontSize: 15, fontWeight: '600', width: 80 },
  modalTitel: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  opslaanTekst: { color: '#FF6B00', fontSize: 15, fontWeight: '700', width: 80, textAlign: 'right' },
  modalInhoud: { padding: 20, paddingBottom: 60, gap: 20 },
  bovenliggendKaart: { backgroundColor: '#1a1a2e', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#003DA5' },
  bovenliggendLabel: { color: '#666', fontSize: 11, marginBottom: 4 },
  bovenliggendNaam: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  soortKnoppen: { flexDirection: 'row', gap: 12 },
  soortKnop: { flex: 1, backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333', borderRadius: 12, padding: 14, alignItems: 'center' },
  soortKnopInkomstActief: { backgroundColor: '#1a2e1a', borderColor: '#4CAF50' },
  soortKnopUitgaveActief: { backgroundColor: '#2d1e0e', borderColor: '#FF6B00' },
  soortKnopTekst: { color: '#555', fontSize: 14, fontWeight: '600' },
  invoerGroep: { gap: 8 },
  label: { color: '#888', fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },
  verplicht: { color: '#FF6B00' },
  invoer: { backgroundColor: '#242424', borderWidth: 1, borderColor: '#333', borderRadius: 12, padding: 14, color: '#ffffff', fontSize: 15 },
  icoonRooster: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  icoonOptie: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#242424', borderWidth: 1, borderColor: '#333', alignItems: 'center', justifyContent: 'center' },
  icoonOptieActief: { backgroundColor: '#1a1a2e', borderColor: '#003DA5', borderWidth: 2 },
  icoonTekst: { fontSize: 22 },
});