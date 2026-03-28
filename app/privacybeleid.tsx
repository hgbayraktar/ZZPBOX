import { useRouter } from 'expo-router';
import {
  ScrollView,
  StatusBar,
  StyleSheet, Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function PrivacybeleidScherm() {
  const router = useRouter();

  return (
    <View style={stijlen.scherm}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />

      <View style={stijlen.koptekst}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={stijlen.terugTekst}>← Terug</Text>
        </TouchableOpacity>
        <Text style={stijlen.koptekstTitel}>Privacybeleid</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={stijlen.scrollInhoud}>

        <Text style={stijlen.versie}>Versie 1.0 — januari 2026</Text>
        <Text style={stijlen.intro}>
          ZZPBox hecht grote waarde aan de privacy van haar gebruikers. Dit beleid is opgesteld conform de Algemene Verordening Gegevensbescherming (AVG).
        </Text>

        <View style={stijlen.sectie}>
          <Text style={stijlen.sectieTitel}>Artikel 1 — Verwerkingsverantwoordelijke</Text>
          <Text style={stijlen.tekst}>
            ZZPBox is de verwerkingsverantwoordelijke voor uw persoonsgegevens.{'\n\n'}
            <Text style={stijlen.vet}>Contact:{'\n'}</Text>
            Website: www.zzpbox.nl{'\n'}
            E-mail: privacy@zzpbox.nl{'\n'}
            Nederland
          </Text>
        </View>

        <View style={stijlen.sectie}>
          <Text style={stijlen.sectieTitel}>Artikel 2 — Welke Gegevens Verzamelen Wij</Text>
          <Text style={stijlen.tekst}>
            <Text style={stijlen.vet}>Accountgegevens:{'\n'}</Text>
            • Voornaam en achternaam{'\n'}
            • E-mailadres{'\n'}
            • Wachtwoord (versleuteld){'\n\n'}
            <Text style={stijlen.vet}>Bedrijfsgegevens:{'\n'}</Text>
            • Bedrijfsnaam, KvK-nummer, BTW-nummer{'\n'}
            • Adresgegevens{'\n\n'}
            <Text style={stijlen.vet}>Financiële gegevens:{'\n'}</Text>
            • Inkomsten en uitgaven{'\n'}
            • Factuurgegevens en klantgegevens{'\n\n'}
            <Text style={stijlen.vet}>Technische gegevens:{'\n'}</Text>
            • Apparaatinformatie{'\n'}
            • Gebruiksstatistieken
          </Text>
        </View>

        <View style={stijlen.sectie}>
          <Text style={stijlen.sectieTitel}>Artikel 3 — Doel van Gegevensverwerking</Text>
          <Text style={stijlen.tekst}>
            • Het leveren en verbeteren van de ZZPBox dienst{'\n'}
            • Het beheren van uw account en abonnement{'\n'}
            • Het verwerken van betalingen via App Store / Google Play{'\n'}
            • Het versturen van facturen namens u{'\n'}
            • Het genereren van financiële rapporten{'\n'}
            • Klantenservice via support@zzpbox.nl{'\n'}
            • Wettelijke verplichtingen
          </Text>
        </View>

        <View style={stijlen.sectie}>
          <Text style={stijlen.sectieTitel}>Artikel 4 — Bewaartermijn</Text>
          <Text style={stijlen.tekst}>
            • Accountgegevens: tot 30 dagen na verwijdering{'\n'}
            • Financiële gegevens: 7 jaar (wettelijke bewaarplicht){'\n'}
            • Technische logs: maximaal 90 dagen
          </Text>
        </View>

        <View style={stijlen.sectie}>
          <Text style={stijlen.sectieTitel}>Artikel 5 — Delen met Derden</Text>
          <Text style={stijlen.tekst}>
            Wij verkopen uw gegevens nooit aan derden.{'\n\n'}
            <Text style={stijlen.vet}>Google Cloud / Firebase:</Text> opslag en authenticatie (EU servers).{'\n\n'}
            <Text style={stijlen.vet}>Betaaldienstverleners:</Text> App Store (Apple) en Google Play voor abonnementsbetalingen.{'\n\n'}
            <Text style={stijlen.vet}>Belastingdienst:</Text> indien wettelijk verplicht.
          </Text>
        </View>

        <View style={stijlen.sectie}>
          <Text style={stijlen.sectieTitel}>Artikel 6 — Beveiliging</Text>
          <Text style={stijlen.tekst}>
            • Alle gegevens versleuteld opgeslagen en verzonden (SSL/TLS){'\n'}
            • Wachtwoorden nooit leesbaar opgeslagen{'\n'}
            • Iedere gebruiker heeft alleen toegang tot eigen gegevens{'\n'}
            • Schermafdrukbeveiliging actief op de applicatie{'\n'}
            • Bij datalek informeren wij u binnen 72 uur via info@zzpbox.nl
          </Text>
        </View>

        <View style={stijlen.sectie}>
          <Text style={stijlen.sectieTitel}>Artikel 7 — Uw Rechten (AVG)</Text>
          <Text style={stijlen.tekst}>
            <Text style={stijlen.vet}>Recht op inzage:</Text> opvragen welke gegevens wij hebben.{'\n\n'}
            <Text style={stijlen.vet}>Recht op rectificatie:</Text> onjuiste gegevens laten corrigeren.{'\n\n'}
            <Text style={stijlen.vet}>Recht op vergetelheid:</Text> verzoeken uw gegevens te verwijderen.{'\n\n'}
            <Text style={stijlen.vet}>Recht op dataportabiliteit:</Text> gegevens opvragen in leesbaar formaat.{'\n\n'}
            <Text style={stijlen.vet}>Recht op bezwaar:</Text> bezwaar maken tegen verwerking van uw gegevens.{'\n\n'}
            Voor alle verzoeken: privacy@zzpbox.nl{'\n\n'}
            Klacht indienen bij de Autoriteit Persoonsgegevens:{'\n'}
            www.autoriteitpersoonsgegevens.nl
          </Text>
        </View>

        <View style={stijlen.sectie}>
          <Text style={stijlen.sectieTitel}>Artikel 8 — Cookies</Text>
          <Text style={stijlen.tekst}>
            ZZPBox is een mobiele applicatie en maakt geen gebruik van tracking cookies. Technische gegevens worden uitsluitend gebruikt voor het verbeteren van de dienst.
          </Text>
        </View>

        <View style={stijlen.sectie}>
          <Text style={stijlen.sectieTitel}>Artikel 9 — Wijzigingen</Text>
          <Text style={stijlen.tekst}>
            ZZPBox behoudt het recht dit privacybeleid te wijzigen. Bij belangrijke wijzigingen worden gebruikers per e-mail geïnformeerd via het bij ons bekende e-mailadres. De actuele versie is altijd beschikbaar in de applicatie.
          </Text>
        </View>

        <View style={stijlen.contactKaart}>
          <Text style={stijlen.contactTitel}>Vragen over privacy?</Text>
          <Text style={stijlen.contactTekst}>privacy@zzpbox.nl</Text>
          <Text style={stijlen.contactOndertekst}>www.zzpbox.nl</Text>
        </View>

        <View style={stijlen.voettekstKaart}>
          <Text style={stijlen.voettekst}>© 2026 ZZPBox — www.zzpbox.nl</Text>
          <Text style={stijlen.voettekst}>Alle rechten voorbehouden</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const stijlen = StyleSheet.create({
  scherm: { flex: 1, backgroundColor: '#1A1A1A' },
  koptekst: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#2a2a2a',
  },
  terugTekst: { color: '#C9A84C', fontSize: 15, fontWeight: '600', width: 60 },
  koptekstTitel: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  scrollInhoud: { padding: 24, paddingBottom: 60 },
  versie: { color: '#555', fontSize: 12, marginBottom: 8 },
  intro: { color: '#888', fontSize: 13, lineHeight: 22, marginBottom: 24 },
  sectie: { backgroundColor: '#242424', borderRadius: 14, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#2a2a2a' },
  sectieTitel: { color: '#C9A84C', fontSize: 14, fontWeight: '800', marginBottom: 10, letterSpacing: 0.5 },
  tekst: { color: '#aaa', fontSize: 13, lineHeight: 22 },
  vet: { color: '#ffffff', fontWeight: '700' },
  contactKaart: { backgroundColor: '#1e1a0e', borderRadius: 14, padding: 18, borderWidth: 1, borderColor: '#3a2e0a', alignItems: 'center', marginBottom: 14, gap: 6 },
  contactTitel: { color: '#C9A84C', fontSize: 14, fontWeight: '700' },
  contactTekst: { color: '#FF6B00', fontSize: 14, fontWeight: '600' },
  contactOndertekst: { color: '#888', fontSize: 12 },
  voettekstKaart: { alignItems: 'center', paddingVertical: 20, borderTopWidth: 1, borderTopColor: '#2a2a2a', marginTop: 10, gap: 4 },
  voettekst: { color: '#444', fontSize: 12 },
});
