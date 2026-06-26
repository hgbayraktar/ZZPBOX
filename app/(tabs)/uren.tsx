import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../constants/firebase';
import { gebruikFacturen, gebruikGebruiker, gebruikKlanten, gebruikPakket, gebruikUren } from '../../hooks/gebruikData';

const BTW_OPTIES = ['21%', '9%', '0%', 'Vrijgesteld'];

function formateerTijd(seconden: number): string {
  const u = Math.floor(seconden / 3600);
  const m = Math.floor((seconden % 3600) / 60);
  const s = seconden % 60;
  return `${String(u).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formateerDuur(minuten: number): string {
  const u = Math.floor(minuten / 60);
  const m = minuten % 60;
  if (u === 0) return `${m} min`;
  if (m === 0) return `${u} uur`;
  return `${u} uur ${m} min`;
}

function parseHHMM(s: string): number | null {
  const parts = s.trim().split(':');
  if (parts.length !== 2) return null;
  const h = parseInt(parts[0]);
  const m = parseInt(parts[1]);
  if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

function vandaag(): string {
  return new Date().toISOString().split('T')[0];
}

function isoNaarHHMM(iso: string): string {
  try {
    const date = new Date(iso);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  } catch {
    return '';
  }
}

function formatDatumLang(d: string): string {
  try {
    const date = new Date(d + 'T12:00:00');
    return date.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });
  } catch {
    return d;
  }
}

export default function UrenScherm() {
  const router = useRouter();
  const pakket = gebruikPakket();
  const { gebruiker } = gebruikGebruiker();
  const { klanten } = gebruikKlanten();
  const { uren, toevoegen, bijwerken, verwijderen } = gebruikUren();
  const { facturen, toevoegen: factuurToevoegen } = gebruikFacturen();

  // Timer state
  const [timerActief, setTimerActief] = useState(false);
  const [timerStart, setTimerStart] = useState<Date | null>(null);
  const [timerSeconden, setTimerSeconden] = useState(0);
  const [timerKlantId, setTimerKlantId] = useState('');
  const [timerOmschrijving, setTimerOmschrijving] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Modals
  const [handmatigModal, setHandmatigModal] = useState(false);
  const [klantPickerVoor, setKlantPickerVoor] = useState<'timer' | 'handmatig' | 'edit' | null>(null);
  const [btwPickerZichtbaar, setBtwPickerZichtbaar] = useState(false);
  const [factuurModal, setFactuurModal] = useState(false);

  // Handmatig form
  const [handDatum, setHandDatum] = useState(vandaag());
  const [handStart, setHandStart] = useState('');
  const [handEind, setHandEind] = useState('');
  const [handKlantId, setHandKlantId] = useState('');
  const [handOmschrijving, setHandOmschrijving] = useState('');

  // Filter
  const [filterKlantId, setFilterKlantId] = useState<string | null>(null);

  // Factuur form
  const [factuurOmschrijving, setFactuurOmschrijving] = useState('');
  const [factuurUurtarief, setFactuurUurtarief] = useState('');
  const [factuurBtw, setFactuurBtw] = useState('21%');

  // Edit form
  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState('');
  const [editDatum, setEditDatum] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEind, setEditEind] = useState('');
  const [editKlantId, setEditKlantId] = useState('');
  const [editOmschrijving, setEditOmschrijving] = useState('');
  const [editGefactureerd, setEditGefactureerd] = useState(false);

  // Timer interval
  useEffect(() => {
    if (timerActief && timerStart) {
      timerRef.current = setInterval(() => {
        setTimerSeconden(Math.floor((Date.now() - timerStart.getTime()) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActief, timerStart]);

  function startTimer() {
    if (pakket === 'gratis') {
      Alert.alert('Premium functie', 'Urenregistratie is alleen beschikbaar met een Premium abonnement.', [
        { text: 'Sluiten', style: 'cancel' },
        { text: 'Upgraden', onPress: () => router.push('/(tabs)/abonnement' as any) },
      ]);
      return;
    }
    const nu = new Date();
    setTimerStart(nu);
    setTimerSeconden(0);
    setTimerActief(true);
  }

  async function stopTimer() {
    if (!timerStart) return;
    setTimerActief(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const eindTijd = new Date();
    const duurMinuten = Math.round((eindTijd.getTime() - timerStart.getTime()) / 60000);

    if (duurMinuten < 1) {
      Alert.alert('Te kort', 'De timer liep minder dan 1 minuut. Niet opgeslagen.');
      setTimerSeconden(0);
      setTimerStart(null);
      return;
    }

    const klantNaam = klantNaamVan(klanten.find(k => k.id === timerKlantId));
    await toevoegen({
      datum: timerStart.toISOString().split('T')[0],
      klantId: timerKlantId || null,
      klantNaam,
      omschrijving: timerOmschrijving || 'Werkzaamheden',
      startTijd: timerStart.toISOString(),
      eindTijd: eindTijd.toISOString(),
      duurMinuten,
      status: 'geregistreerd',
      factuurNummer: null,
    });

    setTimerSeconden(0);
    setTimerStart(null);
    setTimerOmschrijving('');
    setTimerKlantId('');
  }

  async function handmatigOpslaan() {
    const startMin = parseHHMM(handStart);
    const eindMin = parseHHMM(handEind);

    if (!handDatum) { Alert.alert('Fout', 'Vul een datum in.'); return; }
    if (startMin === null) { Alert.alert('Fout', 'Vul de starttijd in als HH:MM (bijv. 09:00).'); return; }
    if (eindMin === null) { Alert.alert('Fout', 'Vul de eindtijd in als HH:MM (bijv. 17:30).'); return; }

    let duurMinuten = eindMin - startMin;
    if (duurMinuten <= 0) duurMinuten += 24 * 60;
    if (duurMinuten < 1) { Alert.alert('Fout', 'Eindtijd moet na starttijd liggen.'); return; }

    const klantNaam = klantNaamVan(klanten.find(k => k.id === handKlantId));
    const startDate = new Date(`${handDatum}T${handStart}:00`);
    const eindDate = new Date(`${handDatum}T${handEind}:00`);

    await toevoegen({
      datum: handDatum,
      klantId: handKlantId || null,
      klantNaam,
      omschrijving: handOmschrijving || 'Werkzaamheden',
      startTijd: startDate.toISOString(),
      eindTijd: eindDate.toISOString(),
      duurMinuten,
      status: 'geregistreerd',
      factuurNummer: null,
    });

    setHandmatigModal(false);
    setKlantPickerVoor(null);
    setHandDatum(vandaag());
    setHandStart('');
    setHandEind('');
    setHandKlantId('');
    setHandOmschrijving('');
  }

  function openEditModal(u: any) {
    setEditId(u.id);
    setEditDatum(u.datum || vandaag());
    setEditStart(isoNaarHHMM(u.startTijd));
    setEditEind(isoNaarHHMM(u.eindTijd));
    setEditKlantId(u.klantId || '');
    setEditOmschrijving(u.omschrijving || '');
    setEditGefactureerd(u.status === 'gefactureerd');
    setEditModal(true);
  }

  async function editOpslaan() {
    const startMin = parseHHMM(editStart);
    const eindMin = parseHHMM(editEind);

    if (!editDatum) { Alert.alert('Fout', 'Vul een datum in.'); return; }
    if (startMin === null) { Alert.alert('Fout', 'Vul de starttijd in als HH:MM (bijv. 09:00).'); return; }
    if (eindMin === null) { Alert.alert('Fout', 'Vul de eindtijd in als HH:MM (bijv. 17:30).'); return; }

    let duurMinuten = eindMin - startMin;
    if (duurMinuten <= 0) duurMinuten += 24 * 60;
    if (duurMinuten < 1) { Alert.alert('Fout', 'Eindtijd moet na starttijd liggen.'); return; }

    const klantNaam = klantNaamVan(klanten.find(k => k.id === editKlantId));
    const startDate = new Date(`${editDatum}T${editStart}:00`);
    const eindDate = new Date(`${editDatum}T${editEind}:00`);

    await bijwerken(editId, {
      datum: editDatum,
      klantId: editKlantId || null,
      klantNaam,
      omschrijving: editOmschrijving || 'Werkzaamheden',
      startTijd: startDate.toISOString(),
      eindTijd: eindDate.toISOString(),
      duurMinuten,
    });

    setEditModal(false);
    setKlantPickerVoor(null);
  }

  function verwijderenBevestigen(id: string) {
    Alert.alert('Verwijderen', 'Weet u zeker dat u deze registratie wilt verwijderen?', [
      { text: 'Annuleren', style: 'cancel' },
      { text: 'Verwijderen', style: 'destructive', onPress: () => verwijderen(id) },
    ]);
  }

  // Filtered + grouped uren
  const gefilterdeUren = filterKlantId
    ? uren.filter((u: any) => u.klantId === filterKlantId)
    : uren;

  const urenPerDatum = [...gefilterdeUren]
    .sort((a: any, b: any) => (b.datum || '').localeCompare(a.datum || ''))
    .reduce((acc: Record<string, any[]>, u: any) => {
      const d = u.datum || vandaag();
      if (!acc[d]) acc[d] = [];
      acc[d].push(u);
      return acc;
    }, {});

  const ongefactureerd = filterKlantId
    ? uren.filter((u: any) => u.klantId === filterKlantId && u.status === 'geregistreerd')
    : [];

  const totaalOngefactureerdMin = ongefactureerd.reduce((s: number, u: any) => s + (u.duurMinuten || 0), 0);

  const klantenMetUren = klanten.filter(k => uren.some((u: any) => u.klantId === k.id));

  function volgendNummer(): string {
    const jaar = new Date().getFullYear();
    const volgnummer = String(facturen.length + 1).padStart(3, '0');
    return `${jaar}-${volgnummer}`;
  }

  function openFactuurModal() {
    if (ongefactureerd.length === 0) {
      Alert.alert('Geen uren', 'Er zijn geen ongefactureerde uren voor deze klant.');
      return;
    }
    const maand = new Date().toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' });
    setFactuurOmschrijving(`Gewerkte uren — ${maand}`);
    setFactuurUurtarief('');
    setFactuurBtw('21%');
    setFactuurModal(true);
  }

  async function factuurAanmaken() {
    const tarief = parseFloat(factuurUurtarief.replace(',', '.'));
    if (!tarief || tarief <= 0) { Alert.alert('Fout', 'Vul een geldig uurtarief in.'); return; }

    const aantalUren = parseFloat((totaalOngefactureerdMin / 60).toFixed(2));
    const klant = klanten.find(k => k.id === filterKlantId);
    const nummer = volgendNummer();
    const nu = new Date();
    const vervaldatum = new Date(nu.getTime() + 30 * 24 * 60 * 60 * 1000);

    const subtotaal = aantalUren * tarief;
    let btwBedrag = 0;
    if (factuurBtw === '21%') btwBedrag = subtotaal * 0.21;
    else if (factuurBtw === '9%') btwBedrag = subtotaal * 0.09;
    const totaal = subtotaal + btwBedrag;

    await factuurToevoegen({
      factuurNummer: nummer,
      soort: 'factuur',
      datum: nu.toISOString().split('T')[0],
      vervaldatum: vervaldatum.toISOString().split('T')[0],
      klantId: filterKlantId,
      klantNaam: klantNaamVan(klant),
      klantAdres: klantAdresVan(klant),
      klantKvk: klant?.kvkNummer || '',
      klantBtw: klant?.btwNummer || '',
      klantEmail: klant?.email || '',
      regels: [{
        id: '1',
        omschrijving: factuurOmschrijving,
        aantal: aantalUren.toString(),
        prijs: tarief.toFixed(2),
        btw: factuurBtw,
        eenheid: 'uur',
      }],
      notities: '',
      status: 'concept',
    });

    if (gebruiker) {
      await addDoc(collection(db, 'gebruikers', gebruiker.uid, 'transacties'), {
        soort: 'inkomst',
        omschrijving: `${nummer} — ${klantNaamVan(klant) || 'Klant'}`,
        bedrag: totaal.toFixed(2),
        btwBedrag: btwBedrag.toFixed(2),
        datum: nu.toISOString().split('T')[0],
        categorie: 'Omzet diensten',
        btw: factuurBtw,
        factuurNummer: nummer,
        aangemaaktOp: new Date().toISOString(),
      });
    }

    for (const u of ongefactureerd) {
      await bijwerken(u.id, { status: 'gefactureerd', factuurNummer: nummer });
    }

    setFactuurModal(false);
    Alert.alert('Factuur aangemaakt', `${nummer} staat klaar in Facturen.`, [{ text: 'OK' }]);
  }

  const handDuurPreview = (() => {
    const s = parseHHMM(handStart);
    const e = parseHHMM(handEind);
    if (s === null || e === null) return null;
    let d = e - s;
    if (d <= 0) d += 24 * 60;
    return formateerDuur(d);
  })();

  const timerKlant = klanten.find(k => k.id === timerKlantId);
  const filterKlant = klanten.find(k => k.id === filterKlantId);

  function klantNaamVan(klant: any): string {
    return klant?.bedrijfsnaam || klant?.naam || '';
  }

  function klantAdresVan(klant: any): string {
    if (!klant) return '';
    const regel1 = [klant.straat, klant.huisnummer].filter(Boolean).join(' ');
    const regel2 = [klant.postcode, klant.plaats].filter(Boolean).join(' ');
    return [regel1, regel2].filter(Boolean).join(', ');
  }

  // Inline klant picker — rendered inside parent modal to avoid nested <Modal> on iOS
  function renderKlantPickerInline(voor: 'handmatig' | 'edit') {
    if (klantPickerVoor !== voor) return null;
    return (
      <View style={s.inlinePickerOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setKlantPickerVoor(null)} />
        <View style={s.klantPickerSheet}>
          <View style={s.klantPickerHeader}>
            <Text style={s.klantPickerTitel}>Klant selecteren</Text>
            <TouchableOpacity onPress={() => setKlantPickerVoor(null)}>
              <Text style={s.modalAnnuleer}>Sluiten</Text>
            </TouchableOpacity>
          </View>
          <ScrollView>
            <TouchableOpacity
              style={s.klantRij}
              onPress={() => {
                if (voor === 'handmatig') setHandKlantId('');
                else setEditKlantId('');
                setKlantPickerVoor(null);
              }}>
              <Text style={s.klantRijTekst}>Geen klant</Text>
            </TouchableOpacity>
            {klanten.map(k => (
              <TouchableOpacity
                key={k.id}
                style={s.klantRij}
                onPress={() => {
                  if (voor === 'handmatig') setHandKlantId(k.id);
                  else setEditKlantId(k.id);
                  setKlantPickerVoor(null);
                }}>
                <Text style={s.klantRijTekst}>{klantNaamVan(k)}</Text>
                {k.contactpersoon ? <Text style={s.klantRijOndertekst}>{k.contactpersoon}</Text> : null}
              </TouchableOpacity>
            ))}
            {klanten.length === 0 && (
              <Text style={{ color: '#555', textAlign: 'center', marginTop: 40, marginBottom: 40 }}>
                Nog geen klanten aangemaakt
              </Text>
            )}
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <View style={s.scherm}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.terugKnop}>
          <Text style={s.terugTekst}>← Terug</Text>
        </TouchableOpacity>
        <Text style={s.headerTitel}>Urenregistratie</Text>
        <TouchableOpacity
          style={s.plusKnop}
          onPress={() => {
            if (pakket === 'gratis') {
              Alert.alert('Premium functie', 'Urenregistratie is alleen beschikbaar met Premium.', [
                { text: 'Sluiten', style: 'cancel' },
                { text: 'Upgraden', onPress: () => router.push('/(tabs)/abonnement' as any) },
              ]);
              return;
            }
            setHandmatigModal(true);
          }}>
          <Text style={s.plusTekst}>+ Handmatig</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scrollInhoud} showsVerticalScrollIndicator={false}>

        {/* Timer kaart */}
        <View style={[s.timerKaart, timerActief && s.timerKaartActief]}>
          {!timerActief ? (
            <>
              <Text style={s.timerLabel}>TIMER</Text>
              <Text style={s.timerDisplay}>00:00:00</Text>
              <TouchableOpacity
                style={s.klantKiezer}
                onPress={() => setKlantPickerVoor('timer')}>
                <Text style={s.klantKiezerTekst}>
                  {timerKlant ? klantNaamVan(timerKlant) : '👤 Klant selecteren (optioneel)'}
                </Text>
              </TouchableOpacity>
              <TextInput
                style={s.omschrijvingInvoer}
                placeholder="Omschrijving van de werkzaamheden"
                placeholderTextColor="#444"
                value={timerOmschrijving}
                onChangeText={setTimerOmschrijving}
                editable={pakket !== 'gratis'}
              />
              <TouchableOpacity style={s.startKnop} onPress={startTimer} activeOpacity={0.8}>
                <Text style={s.startKnopTekst}>▶ Start Timer</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={s.timerLabel}>BEZIG MET WERKEN</Text>
              <Text style={s.timerDisplayActief}>{formateerTijd(timerSeconden)}</Text>
              {timerKlant && <Text style={s.timerKlantNaam}>{klantNaamVan(timerKlant)}</Text>}
              {timerOmschrijving ? <Text style={s.timerOmschrijving}>{timerOmschrijving}</Text> : null}
              <TouchableOpacity style={s.stopKnop} onPress={stopTimer} activeOpacity={0.8}>
                <Text style={s.stopKnopTekst}>■ Stop & Opslaan</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Premium gate hint */}
        {pakket === 'gratis' && (
          <TouchableOpacity
            style={s.premiumBanner}
            onPress={() => router.push('/(tabs)/abonnement' as any)}
            activeOpacity={0.8}>
            <Text style={s.premiumBannerTekst}>🔒 Urenregistratie is een Premium functie — Upgraden</Text>
          </TouchableOpacity>
        )}

        {/* Filter tabs */}
        {klantenMetUren.length > 0 && (
          <>
            <Text style={s.sectieTitel}>FILTER OP KLANT</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRij}>
              <TouchableOpacity
                style={[s.filterTab, !filterKlantId && s.filterTabActief]}
                onPress={() => setFilterKlantId(null)}>
                <Text style={[s.filterTabTekst, !filterKlantId && s.filterTabTekstActief]}>Alle</Text>
              </TouchableOpacity>
              {klantenMetUren.map(k => (
                <TouchableOpacity
                  key={k.id}
                  style={[s.filterTab, filterKlantId === k.id && s.filterTabActief]}
                  onPress={() => setFilterKlantId(filterKlantId === k.id ? null : k.id)}>
                  <Text style={[s.filterTabTekst, filterKlantId === k.id && s.filterTabTekstActief]}>
                    {klantNaamVan(k)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Factuur aanmaken knop */}
        {filterKlantId && ongefactureerd.length > 0 && (
          <TouchableOpacity style={s.factuurKnop} onPress={openFactuurModal} activeOpacity={0.8}>
            <View>
              <Text style={s.factuurKnopTitel}>📄 Factuur aanmaken voor {klantNaamVan(filterKlant)}</Text>
              <Text style={s.factuurKnopOndertitel}>
                {ongefactureerd.length} registraties · {formateerDuur(totaalOngefactureerdMin)} ongefactureerd
              </Text>
            </View>
            <Text style={s.factuurKnopPijl}>→</Text>
          </TouchableOpacity>
        )}

        {/* Uren lijst */}
        {Object.keys(urenPerDatum).length === 0 ? (
          <View style={s.legeKaart}>
            <Text style={s.leegIcoon}>⏱️</Text>
            <Text style={s.leegTekst}>Nog geen uren geregistreerd</Text>
            <Text style={s.leegOndertekst}>
              {pakket === 'gratis'
                ? 'Upgrade naar Premium om te beginnen'
                : 'Start de timer of voeg handmatig uren toe'}
            </Text>
          </View>
        ) : (
          Object.entries(urenPerDatum).map(([datum, entries]) => {
            const dagTotaal = (entries as any[]).reduce((s, u) => s + (u.duurMinuten || 0), 0);
            return (
              <View key={datum} style={s.dagGroep}>
                <View style={s.dagHeader}>
                  <Text style={s.dagDatum}>{formatDatumLang(datum)}</Text>
                  <Text style={s.dagTotaal}>{formateerDuur(dagTotaal)}</Text>
                </View>
                {(entries as any[]).map((u: any) => (
                  <TouchableOpacity
                    key={u.id}
                    style={s.urenKaart}
                    onPress={() => openEditModal(u)}
                    onLongPress={() => verwijderenBevestigen(u.id)}
                    activeOpacity={0.8}>
                    <View style={[s.urenBalk, { backgroundColor: u.status === 'gefactureerd' ? '#444' : '#C9A84C' }]} />
                    <View style={s.urenInhoud}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.urenOmschrijving}>{u.omschrijving}</Text>
                        {u.klantNaam ? <Text style={s.urenKlant}>{u.klantNaam}</Text> : null}
                      </View>
                      <View style={s.urenRechts}>
                        <Text style={s.urenDuur}>{formateerDuur(u.duurMinuten || 0)}</Text>
                        <View style={[s.statusChip, u.status === 'gefactureerd' && s.statusChipGefactureerd]}>
                          <Text style={[s.statusTekst, u.status === 'gefactureerd' && s.statusTekstGefactureerd]}>
                            {u.status === 'gefactureerd' ? `${u.factuurNummer}` : 'Ongefactureerd'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            );
          })
        )}

        <Text style={s.tipTekst}>Tik om te bewerken · Houd ingedrukt om te verwijderen</Text>

      </ScrollView>

      {/* === Bewerken modal === */}
      <Modal visible={editModal} animationType="slide" presentationStyle="pageSheet">
        <View style={s.modalScherm}>
          <View style={s.modalHeader}>
            <TouchableOpacity onPress={() => { setEditModal(false); setKlantPickerVoor(null); }}>
              <Text style={s.modalAnnuleer}>Annuleren</Text>
            </TouchableOpacity>
            <Text style={s.modalTitel}>Registratie bewerken</Text>
            <TouchableOpacity onPress={editOpslaan}>
              <Text style={s.modalOpslaan}>Opslaan</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={s.modalInhoud}>
            {editGefactureerd && (
              <View style={s.gewarschuwd}>
                <Text style={s.gewaarschuwd_tekst}>
                  ⚠️ Deze registratie is al gefactureerd ({(uren.find((u: any) => u.id === editId) as any)?.factuurNummer}). Bewerken heeft geen invloed op de bestaande factuur.
                </Text>
              </View>
            )}

            <Text style={s.veldLabel}>DATUM</Text>
            <TextInput
              style={s.veld}
              placeholder="JJJJ-MM-DD (bijv. 2026-06-26)"
              placeholderTextColor="#444"
              value={editDatum}
              onChangeText={setEditDatum}
              keyboardType="numbers-and-punctuation"
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={s.veldLabel}>STARTTIJD</Text>
                <TextInput
                  style={s.veld}
                  placeholder="09:00"
                  placeholderTextColor="#444"
                  value={editStart}
                  onChangeText={setEditStart}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.veldLabel}>EINDTIJD</Text>
                <TextInput
                  style={s.veld}
                  placeholder="17:30"
                  placeholderTextColor="#444"
                  value={editEind}
                  onChangeText={setEditEind}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
            </View>

            {(() => {
              const sv = parseHHMM(editStart);
              const ev = parseHHMM(editEind);
              if (sv === null || ev === null) return null;
              let d = ev - sv;
              if (d <= 0) d += 24 * 60;
              return (
                <View style={s.duurPreview}>
                  <Text style={s.duurPreviewTekst}>⏱ {formateerDuur(d)}</Text>
                </View>
              );
            })()}

            <Text style={s.veldLabel}>KLANT (OPTIONEEL)</Text>
            <TouchableOpacity
              style={s.veld}
              onPress={() => setKlantPickerVoor('edit')}>
              <Text style={{ color: editKlantId ? '#fff' : '#444', fontSize: 15 }}>
                {editKlantId ? (klantNaamVan(klanten.find(k => k.id === editKlantId)) || 'Klant') : 'Selecteer een klant'}
              </Text>
            </TouchableOpacity>

            <Text style={s.veldLabel}>OMSCHRIJVING</Text>
            <TextInput
              style={[s.veld, { minHeight: 80, textAlignVertical: 'top' }]}
              placeholder="Wat heeft u gedaan?"
              placeholderTextColor="#444"
              value={editOmschrijving}
              onChangeText={setEditOmschrijving}
              multiline
            />
          </ScrollView>

          {/* Klant picker inline — geen nested Modal */}
          {renderKlantPickerInline('edit')}
        </View>
      </Modal>

      {/* === Handmatig toevoegen modal === */}
      <Modal visible={handmatigModal} animationType="slide" presentationStyle="pageSheet">
        <View style={s.modalScherm}>
          <View style={s.modalHeader}>
            <TouchableOpacity onPress={() => { setHandmatigModal(false); setKlantPickerVoor(null); }}>
              <Text style={s.modalAnnuleer}>Annuleren</Text>
            </TouchableOpacity>
            <Text style={s.modalTitel}>Uren toevoegen</Text>
            <TouchableOpacity onPress={handmatigOpslaan}>
              <Text style={s.modalOpslaan}>Opslaan</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={s.modalInhoud}>
            <Text style={s.veldLabel}>DATUM</Text>
            <TextInput
              style={s.veld}
              placeholder="JJJJ-MM-DD (bijv. 2026-06-26)"
              placeholderTextColor="#444"
              value={handDatum}
              onChangeText={setHandDatum}
              keyboardType="numbers-and-punctuation"
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={s.veldLabel}>STARTTIJD</Text>
                <TextInput
                  style={s.veld}
                  placeholder="09:00"
                  placeholderTextColor="#444"
                  value={handStart}
                  onChangeText={setHandStart}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.veldLabel}>EINDTIJD</Text>
                <TextInput
                  style={s.veld}
                  placeholder="17:30"
                  placeholderTextColor="#444"
                  value={handEind}
                  onChangeText={setHandEind}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
            </View>

            {handDuurPreview && (
              <View style={s.duurPreview}>
                <Text style={s.duurPreviewTekst}>⏱ {handDuurPreview}</Text>
              </View>
            )}

            <Text style={s.veldLabel}>KLANT (OPTIONEEL)</Text>
            <TouchableOpacity
              style={s.veld}
              onPress={() => setKlantPickerVoor('handmatig')}>
              <Text style={{ color: handKlantId ? '#fff' : '#444', fontSize: 15 }}>
                {handKlantId ? (klantNaamVan(klanten.find(k => k.id === handKlantId)) || 'Klant') : 'Selecteer een klant'}
              </Text>
            </TouchableOpacity>

            <Text style={s.veldLabel}>OMSCHRIJVING</Text>
            <TextInput
              style={[s.veld, { minHeight: 80, textAlignVertical: 'top' }]}
              placeholder="Wat heeft u gedaan?"
              placeholderTextColor="#444"
              value={handOmschrijving}
              onChangeText={setHandOmschrijving}
              multiline
            />
          </ScrollView>

          {/* Klant picker inline — geen nested Modal */}
          {renderKlantPickerInline('handmatig')}
        </View>
      </Modal>

      {/* === Klant picker voor timer (geen parent modal, dus gewone Modal is OK) === */}
      <Modal visible={klantPickerVoor === 'timer'} animationType="fade" transparent>
        <View style={s.klantPickerOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setKlantPickerVoor(null)} />
          <View style={s.klantPickerSheet}>
            <View style={s.klantPickerHeader}>
              <Text style={s.klantPickerTitel}>Klant selecteren</Text>
              <TouchableOpacity onPress={() => setKlantPickerVoor(null)}>
                <Text style={s.modalAnnuleer}>Sluiten</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              <TouchableOpacity
                style={s.klantRij}
                onPress={() => {
                  setTimerKlantId('');
                  setKlantPickerVoor(null);
                }}>
                <Text style={s.klantRijTekst}>Geen klant</Text>
              </TouchableOpacity>
              {klanten.map(k => (
                <TouchableOpacity
                  key={k.id}
                  style={s.klantRij}
                  onPress={() => {
                    setTimerKlantId(k.id);
                    setKlantPickerVoor(null);
                  }}>
                  <Text style={s.klantRijTekst}>{klantNaamVan(k)}</Text>
                  {k.contactpersoon ? <Text style={s.klantRijOndertekst}>{k.contactpersoon}</Text> : null}
                </TouchableOpacity>
              ))}
              {klanten.length === 0 && (
                <Text style={{ color: '#555', textAlign: 'center', marginTop: 40, marginBottom: 40 }}>
                  Nog geen klanten aangemaakt
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* === Factuur aanmaken modal === */}
      <Modal visible={factuurModal} animationType="slide" presentationStyle="pageSheet">
        <View style={s.modalScherm}>
          <View style={s.modalHeader}>
            <TouchableOpacity onPress={() => { setFactuurModal(false); setBtwPickerZichtbaar(false); }}>
              <Text style={s.modalAnnuleer}>Annuleren</Text>
            </TouchableOpacity>
            <Text style={s.modalTitel}>Factuur aanmaken</Text>
            <TouchableOpacity onPress={factuurAanmaken}>
              <Text style={s.modalOpslaan}>Aanmaken</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={s.modalInhoud}>
            <View style={s.samenvattingKaart}>
              <Text style={s.samenvattingKlant}>{klantNaamVan(filterKlant) || 'Klant'}</Text>
              <Text style={s.samenvattingUren}>
                {formateerDuur(totaalOngefactureerdMin)} · {ongefactureerd.length} registraties
              </Text>
              <Text style={s.samenvattingDecimaal}>
                = {(totaalOngefactureerdMin / 60).toFixed(2).replace('.', ',')} uur
              </Text>
            </View>

            <Text style={s.veldLabel}>OMSCHRIJVING OP FACTUUR</Text>
            <TextInput
              style={s.veld}
              value={factuurOmschrijving}
              onChangeText={setFactuurOmschrijving}
              placeholderTextColor="#444"
            />

            <Text style={s.veldLabel}>UURTARIEF (€)</Text>
            <TextInput
              style={s.veld}
              placeholder="bijv. 85,00"
              placeholderTextColor="#444"
              value={factuurUurtarief}
              onChangeText={setFactuurUurtarief}
              keyboardType="decimal-pad"
            />

            <Text style={s.veldLabel}>BTW</Text>
            <TouchableOpacity style={s.veld} onPress={() => setBtwPickerZichtbaar(true)}>
              <Text style={{ color: '#fff', fontSize: 15 }}>{factuurBtw}</Text>
            </TouchableOpacity>

            {factuurUurtarief ? (() => {
              const tarief = parseFloat(factuurUurtarief.replace(',', '.'));
              if (!tarief) return null;
              const uren = totaalOngefactureerdMin / 60;
              const sub = uren * tarief;
              let btw = 0;
              if (factuurBtw === '21%') btw = sub * 0.21;
              else if (factuurBtw === '9%') btw = sub * 0.09;
              const totaal = sub + btw;
              const euro = (b: number) => `€ ${b.toFixed(2).replace('.', ',')}`;
              return (
                <View style={s.totaalKaart}>
                  <View style={s.totaalRij}>
                    <Text style={s.totaalLabel}>Subtotaal</Text>
                    <Text style={s.totaalWaarde}>{euro(sub)}</Text>
                  </View>
                  <View style={s.totaalRij}>
                    <Text style={s.totaalLabel}>BTW ({factuurBtw})</Text>
                    <Text style={s.totaalWaarde}>{euro(btw)}</Text>
                  </View>
                  <View style={[s.totaalRij, { borderTopWidth: 1, borderTopColor: '#333', paddingTop: 12 }]}>
                    <Text style={[s.totaalLabel, { color: '#C9A84C', fontWeight: '700' }]}>Totaal</Text>
                    <Text style={[s.totaalWaarde, { color: '#C9A84C', fontWeight: '800', fontSize: 18 }]}>{euro(totaal)}</Text>
                  </View>
                </View>
              );
            })() : null}

            <Text style={s.factuurInfoTekst}>
              Na het aanmaken kunt u de factuur vinden en versturen via het Facturen scherm.
            </Text>
          </ScrollView>

          {/* BTW picker inline — geen nested Modal */}
          {btwPickerZichtbaar && (
            <View style={s.inlinePickerOverlay}>
              <Pressable style={StyleSheet.absoluteFill} onPress={() => setBtwPickerZichtbaar(false)} />
              <View style={[s.klantPickerSheet, { paddingBottom: 20 }]}>
                <View style={s.klantPickerHeader}>
                  <Text style={s.klantPickerTitel}>BTW selecteren</Text>
                  <TouchableOpacity onPress={() => setBtwPickerZichtbaar(false)}>
                    <Text style={s.modalAnnuleer}>Sluiten</Text>
                  </TouchableOpacity>
                </View>
                {BTW_OPTIES.map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={[s.klantRij, factuurBtw === opt && { backgroundColor: '#1e1a0e' }]}
                    onPress={() => { setFactuurBtw(opt); setBtwPickerZichtbaar(false); }}>
                    <Text style={[s.klantRijTekst, factuurBtw === opt && { color: '#C9A84C', fontWeight: '700' }]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </Modal>

    </View>
  );
}

const s = StyleSheet.create({
  scherm: { flex: 1, backgroundColor: '#1A1A1A' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  terugKnop: { width: 80 },
  terugTekst: { color: '#C9A84C', fontSize: 15 },
  headerTitel: { color: '#fff', fontSize: 17, fontWeight: '700' },
  plusKnop: { width: 80, alignItems: 'flex-end' },
  plusTekst: { color: '#C9A84C', fontSize: 14, fontWeight: '600' },

  scrollInhoud: { padding: 20, paddingBottom: 60 },

  timerKaart: { backgroundColor: '#242424', borderRadius: 20, padding: 24, marginBottom: 16, borderWidth: 1, borderColor: '#333', alignItems: 'center', gap: 14 },
  timerKaartActief: { borderColor: '#4CAF50', backgroundColor: '#1a2a1a' },
  timerLabel: { color: '#666', fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  timerDisplay: { color: '#444', fontSize: 48, fontWeight: '200', letterSpacing: 4, fontVariant: ['tabular-nums'] },
  timerDisplayActief: { color: '#4CAF50', fontSize: 52, fontWeight: '700', letterSpacing: 4, fontVariant: ['tabular-nums'] },
  timerKlantNaam: { color: '#C9A84C', fontSize: 16, fontWeight: '600' },
  timerOmschrijving: { color: '#888', fontSize: 14 },
  klantKiezer: { width: '100%', backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333', borderRadius: 10, padding: 14 },
  klantKiezerTekst: { color: '#888', fontSize: 15 },
  omschrijvingInvoer: { width: '100%', backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333', borderRadius: 10, padding: 14, color: '#fff', fontSize: 15 },
  startKnop: { backgroundColor: '#4CAF50', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 40 },
  startKnopTekst: { color: '#fff', fontSize: 16, fontWeight: '700' },
  stopKnop: { backgroundColor: '#f44336', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 40 },
  stopKnopTekst: { color: '#fff', fontSize: 16, fontWeight: '700' },

  premiumBanner: { backgroundColor: '#1e1a0e', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#3a2e0a', alignItems: 'center' },
  premiumBannerTekst: { color: '#C9A84C', fontSize: 14, fontWeight: '600' },

  sectieTitel: { color: '#555', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 10, marginTop: 4 },
  filterRij: { marginBottom: 16 },
  filterTab: { backgroundColor: '#242424', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: '#333' },
  filterTabActief: { backgroundColor: '#C9A84C', borderColor: '#C9A84C' },
  filterTabTekst: { color: '#888', fontSize: 13, fontWeight: '600' },
  filterTabTekstActief: { color: '#1A1A1A' },

  factuurKnop: { backgroundColor: '#1e2a1e', borderRadius: 14, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#2a4a2a', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  factuurKnopTitel: { color: '#4CAF50', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  factuurKnopOndertitel: { color: '#666', fontSize: 13 },
  factuurKnopPijl: { color: '#4CAF50', fontSize: 22, fontWeight: '300' },

  dagGroep: { marginBottom: 20 },
  dagHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  dagDatum: { color: '#888', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  dagTotaal: { color: '#C9A84C', fontSize: 12, fontWeight: '700' },

  urenKaart: { flexDirection: 'row', backgroundColor: '#242424', borderRadius: 12, marginBottom: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#2a2a2a' },
  urenBalk: { width: 4 },
  urenInhoud: { flex: 1, flexDirection: 'row', padding: 14, alignItems: 'center', gap: 12 },
  urenOmschrijving: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 2 },
  urenKlant: { color: '#666', fontSize: 12 },
  urenRechts: { alignItems: 'flex-end', gap: 6 },
  urenDuur: { color: '#fff', fontSize: 15, fontWeight: '700' },
  statusChip: { backgroundColor: '#1e2a1e', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusChipGefactureerd: { backgroundColor: '#2a2a2a' },
  statusTekst: { color: '#4CAF50', fontSize: 10, fontWeight: '700' },
  statusTekstGefactureerd: { color: '#555' },

  legeKaart: { backgroundColor: '#242424', borderRadius: 16, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: '#2a2a2a', gap: 10 },
  leegIcoon: { fontSize: 40 },
  leegTekst: { color: '#666', fontSize: 15, fontWeight: '600' },
  leegOndertekst: { color: '#444', fontSize: 13, textAlign: 'center' },

  tipTekst: { color: '#333', fontSize: 12, textAlign: 'center', marginTop: 16 },
  gewarschuwd: { backgroundColor: '#2a2000', borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#554400' },
  gewaarschuwd_tekst: { color: '#C9A84C', fontSize: 13, lineHeight: 20 },

  modalScherm: { flex: 1, backgroundColor: '#1A1A1A' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 56, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  modalTitel: { color: '#fff', fontSize: 17, fontWeight: '700' },
  modalAnnuleer: { color: '#888', fontSize: 16, width: 80 },
  modalOpslaan: { color: '#C9A84C', fontSize: 16, fontWeight: '700', width: 80, textAlign: 'right' },
  modalInhoud: { padding: 20 },

  veldLabel: { color: '#555', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8, marginTop: 20 },
  veld: { backgroundColor: '#242424', borderRadius: 12, padding: 15, color: '#fff', fontSize: 15, borderWidth: 1, borderColor: '#333' },

  duurPreview: { backgroundColor: '#1e2a1e', borderRadius: 10, padding: 12, marginTop: 8, alignItems: 'center' },
  duurPreviewTekst: { color: '#4CAF50', fontSize: 15, fontWeight: '700' },

  // Inline picker overlay — absolute over parent modal, geen nested <Modal>
  inlinePickerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end', zIndex: 10 },

  // Klant picker voor timer — staat buiten een modal, dus gewone Modal is OK
  klantPickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  klantPickerSheet: { backgroundColor: '#1A1A1A', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%', width: '100%', paddingHorizontal: 20, paddingBottom: 40 },
  klantPickerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#2a2a2a', marginBottom: 4 },
  klantPickerTitel: { color: '#fff', fontSize: 17, fontWeight: '700' },

  klantRij: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  klantRijTekst: { color: '#fff', fontSize: 16 },
  klantRijOndertekst: { color: '#555', fontSize: 13, marginTop: 2 },

  samenvattingKaart: { backgroundColor: '#242424', borderRadius: 14, padding: 20, marginBottom: 8, borderWidth: 1, borderColor: '#333', alignItems: 'center', gap: 4 },
  samenvattingKlant: { color: '#C9A84C', fontSize: 18, fontWeight: '700' },
  samenvattingUren: { color: '#888', fontSize: 14 },
  samenvattingDecimaal: { color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 4 },

  totaalKaart: { backgroundColor: '#242424', borderRadius: 14, padding: 18, marginTop: 16, borderWidth: 1, borderColor: '#333', gap: 10 },
  totaalRij: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totaalLabel: { color: '#888', fontSize: 14 },
  totaalWaarde: { color: '#fff', fontSize: 15, fontWeight: '600' },

  factuurInfoTekst: { color: '#444', fontSize: 13, textAlign: 'center', marginTop: 24, lineHeight: 20 },
});
