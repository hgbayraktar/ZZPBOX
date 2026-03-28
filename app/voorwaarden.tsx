import { useRouter } from 'expo-router';
import {
  ScrollView,
  StatusBar,
  StyleSheet, Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function VoorwaardenScherm() {
  const router = useRouter();

  return (
    <View style={stijlen.scherm}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />

      <View style={stijlen.koptekst}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={stijlen.terugTekst}>← Terug</Text>
        </TouchableOpacity>
        <Text style={stijlen.koptekstTitel}>Algemene Voorwaarden</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={stijlen.scrollInhoud}>

        <Text style={stijlen.versie}>Versie 1.0 — januari 2026</Text>
        <Text style={stijlen.bedrijf}>ZZPBox | www.zzpbox.nl | info@zzpbox.nl</Text>

        <View style={stijlen.sectie}>
          <Text style={stijlen.sectieTitel}>Artikel 1 — Definities</Text>
          <Text style={stijlen.tekst}>
            In deze algemene voorwaarden wordt verstaan onder:{'\n\n'}
            <Text style={stijlen.vet}>ZZPBox:</Text> de mobiele applicatie en bijbehorende diensten, aangeboden door ZZPBox via www.zzpbox.nl.{'\n\n'}
            <Text style={stijlen.vet}>Gebruiker:</Text> de natuurlijke persoon of rechtspersoon die gebruik maakt van ZZPBox.{'\n\n'}
            <Text style={stijlen.vet}>Abonnement:</Text> de overeenkomst tussen gebruiker en ZZPBox voor het gebruik van de applicatie tegen een periodiek tarief.{'\n\n'}
            <Text style={stijlen.vet}>Gegevens:</Text> alle financiële en persoonlijke informatie die de gebruiker invoert in de applicatie.
          </Text>
        </View>

        <View style={stijlen.sectie}>
          <Text style={stijlen.sectieTitel}>Artikel 2 — Toepasselijkheid</Text>
          <Text style={stijlen.tekst}>
            2.1 Deze algemene voorwaarden zijn van toepassing op alle overeenkomsten tussen ZZPBox en de gebruiker.{'\n\n'}
            2.2 Door het aanmaken van een account gaat de gebruiker akkoord met deze voorwaarden.{'\n\n'}
            2.3 ZZPBox behoudt het recht deze voorwaarden te wijzigen. Gebruikers worden hiervan per e-mail op de hoogte gesteld.
          </Text>
        </View>

        <View style={stijlen.sectie}>
          <Text style={stijlen.sectieTitel}>Artikel 3 — Abonnementen en Betalingen</Text>
          <Text style={stijlen.tekst}>
            3.1 ZZPBox biedt de volgende abonnementen aan:{'\n\n'}
            <Text style={stijlen.vet}>Gratis:</Text> €0 — beperkt gebruik (max. 3 invoeren per dag, max. 20 per maand, max. 3 klanten, max. 5 producten/diensten). Inclusief advertenties.{'\n\n'}
            <Text style={stijlen.vet}>Premium Maandelijks:</Text> €11,99 per maand — onbeperkt gebruik, facturen, PDF delen, geen advertenties.{'\n\n'}
            <Text style={stijlen.vet}>Premium Kwartaal:</Text> €31,47 per kwartaal (€10,49/maand) — zelfde voordelen als maandelijks, 13% korting.{'\n\n'}
            <Text style={stijlen.vet}>Premium Jaarlijks:</Text> €119,88 per jaar (€9,99/maand) — zelfde voordelen als maandelijks, 17% korting.{'\n\n'}
            3.2 Nieuwe gebruikers starten automatisch met het Gratis pakket.{'\n\n'}
            3.3 Betalingen worden automatisch verwerkt via de App Store (iOS) of Google Play (Android).{'\n\n'}
            3.4 Bij niet-betaling wordt de toegang tot Premium functies opgeschort.
          </Text>
        </View>

        <View style={stijlen.sectie}>
          <Text style={stijlen.sectieTitel}>Artikel 4 — Herroepingsrecht en Annulering</Text>
          <Text style={stijlen.tekst}>
            4.1 De gebruiker heeft het recht het abonnement op elk moment op te zeggen via de App Store of Google Play.{'\n\n'}
            4.2 Bij opzegging blijft het abonnement actief tot het einde van de betaalde periode.{'\n\n'}
            4.3 Reeds betaalde bedragen worden niet gerestitueerd, tenzij wettelijk verplicht.{'\n\n'}
            4.4 Conform de Wet Koop op Afstand geldt een herroepingsrecht van 14 dagen na aankoop voor nieuwe abonnementen.{'\n\n'}
            4.5 Voor vragen over annulering: support@zzpbox.nl
          </Text>
        </View>

        <View style={stijlen.sectie}>
          <Text style={stijlen.sectieTitel}>Artikel 5 — Gebruik van de Applicatie</Text>
          <Text style={stijlen.tekst}>
            5.1 De gebruiker is verantwoordelijk voor de juistheid van de ingevoerde gegevens.{'\n\n'}
            5.2 ZZPBox is een hulpmiddel voor administratie en vervangt geen officieel boekhoudadvies of belastingadvies.{'\n\n'}
            5.3 Het is de gebruiker niet toegestaan de applicatie te gebruiken voor onrechtmatige doeleinden.{'\n\n'}
            5.4 ZZPBox behoudt het recht accounts te blokkeren bij misbruik of schending van deze voorwaarden.
          </Text>
        </View>

        <View style={stijlen.sectie}>
          <Text style={stijlen.sectieTitel}>Artikel 6 — Aansprakelijkheid</Text>
          <Text style={stijlen.tekst}>
            6.1 ZZPBox is niet aansprakelijk voor financiële schade die voortvloeit uit onjuist gebruik van de applicatie.{'\n\n'}
            6.2 ZZPBox is niet verantwoordelijk voor belastingaangiften of fiscale verplichtingen van de gebruiker.{'\n\n'}
            6.3 De aansprakelijkheid van ZZPBox is in alle gevallen beperkt tot het bedrag dat de gebruiker in de afgelopen drie maanden heeft betaald.
          </Text>
        </View>

        <View style={stijlen.sectie}>
          <Text style={stijlen.sectieTitel}>Artikel 7 — Intellectueel Eigendom</Text>
          <Text style={stijlen.tekst}>
            7.1 Alle intellectuele eigendomsrechten van ZZPBox berusten bij ZZPBox.{'\n\n'}
            7.2 Het is de gebruiker niet toegestaan de applicatie te kopiëren, aan te passen of te verspreiden zonder voorafgaande schriftelijke toestemming.
          </Text>
        </View>

        <View style={stijlen.sectie}>
          <Text style={stijlen.sectieTitel}>Artikel 8 — Toepasselijk Recht</Text>
          <Text style={stijlen.tekst}>
            8.1 Op deze voorwaarden is Nederlands recht van toepassing.{'\n\n'}
            8.2 Geschillen worden voorgelegd aan de bevoegde rechter in Nederland.{'\n\n'}
            8.3 Voor vragen over deze voorwaarden: info@zzpbox.nl
          </Text>
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
  versie: { color: '#555', fontSize: 12, marginBottom: 4 },
  bedrijf: { color: '#555', fontSize: 12, marginBottom: 28 },
  sectie: { backgroundColor: '#242424', borderRadius: 14, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#2a2a2a' },
  sectieTitel: { color: '#C9A84C', fontSize: 14, fontWeight: '800', marginBottom: 10, letterSpacing: 0.5 },
  tekst: { color: '#aaa', fontSize: 13, lineHeight: 22 },
  vet: { color: '#ffffff', fontWeight: '700' },
  voettekstKaart: { alignItems: 'center', paddingVertical: 20, borderTopWidth: 1, borderTopColor: '#2a2a2a', marginTop: 10, gap: 4 },
  voettekst: { color: '#444', fontSize: 12 },
});