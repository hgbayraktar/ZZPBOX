import { useRouter } from 'expo-router';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function Sectie({ icoon, titel, children }: { icoon: string; titel: string; children: React.ReactNode }) {
  return (
    <View style={s.sectie}>
      <View style={s.sectieKoptekst}>
        <Text style={s.sectieIcoon}>{icoon}</Text>
        <Text style={s.sectieTitel}>{titel}</Text>
      </View>
      <View style={s.sectieInhoud}>{children}</View>
    </View>
  );
}

function Punt({ tekst }: { tekst: string }) {
  return (
    <View style={s.punt}>
      <Text style={s.puntBullet}>·</Text>
      <Text style={s.puntTekst}>{tekst}</Text>
    </View>
  );
}

function Stap({ nummer, tekst }: { nummer: string; tekst: string }) {
  return (
    <View style={s.stap}>
      <View style={s.stapNummer}>
        <Text style={s.stapNummerTekst}>{nummer}</Text>
      </View>
      <Text style={s.stapTekst}>{tekst}</Text>
    </View>
  );
}

function Tip({ tekst }: { tekst: string }) {
  return (
    <View style={s.tip}>
      <Text style={s.tipIcoon}>💡</Text>
      <Text style={s.tipTekst}>{tekst}</Text>
    </View>
  );
}

export default function HandleidingScherm() {
  const router = useRouter();

  return (
    <View style={s.scherm}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />

      <View style={s.koptekst}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.terugTekst}>← Terug</Text>
        </TouchableOpacity>
        <Text style={s.koptekstTitel}>Handleiding</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={s.inhoud}>

        <View style={s.welkomKaart}>
          <Text style={s.welkomIcoon}>📘</Text>
          <Text style={s.welkomTitel}>Welkom bij ZZPBox</Text>
          <Text style={s.welkomTekst}>
            ZZPBox is uw digitale administratie-assistent voor zzp'ers. In deze handleiding leest u hoe u snel aan de slag kunt.
          </Text>
        </View>

        <Sectie icoon="🚀" titel="Aan de slag">
          <Stap nummer="1" tekst="Ga naar Instellingen → Bedrijfsgegevens en vul uw bedrijfsnaam, KvK-nummer, BTW-nummer en IBAN in. Deze gegevens verschijnen automatisch op uw facturen en offertes." />
          <Stap nummer="2" tekst="Controleer uw categorieën via Instellingen → Categorieën. ZZPBox maakt standaard categorieën aan voor inkomsten en uitgaven. U kunt deze aanpassen of eigen categorieën toevoegen." />
          <Stap nummer="3" tekst="Bent u al actief als zzp'er en heeft u al facturen verstuurd? Stel dan uw factuurnummer in via het ⚙️-icoon in het facturenscherm, zodat de nummering naadloos doorloopt." />
        </Sectie>

        <Sectie icoon="📄" titel="Facturen">
          <Punt tekst="Tik op '+ Nieuw' om een nieuwe factuur aan te maken." />
          <Punt tekst="Selecteer een bestaande klant of vul de klantgegevens handmatig in." />
          <Punt tekst="Voeg regelitems toe met omschrijving, aantal, prijs en BTW-tarief (21%, 9%, 0% of Vrijgesteld)." />
          <Punt tekst="Sla de factuur op als concept en verstuur de PDF wanneer u klaar bent." />
          <Punt tekst="Wijzig de status van een factuur via de detailweergave: Concept → Verzonden → Betaald." />
          <Punt tekst="⚙️ Factuurnummer instellen: tik op het tandwiel rechtsboven om het startnummer in te stellen. Handig als u vanuit een ander systeem overstapt." />
          <Tip tekst="Vul uw IBAN altijd in bij bedrijfsgegevens — dit verschijnt automatisch in het betalingsblok van uw factuur." />
        </Sectie>

        <Sectie icoon="↩" titel="Creditnota's">
          <Punt tekst="Open een bestaande factuur en tik op 'Creditnota aanmaken'." />
          <Punt tekst="De creditnota krijgt automatisch een eigen nummer (CN-...) en is gekoppeld aan de originele factuur." />
          <Punt tekst="Gebruik een creditnota als u een factuur wilt corrigeren of annuleren." />
        </Sectie>

        <Sectie icoon="📋" titel="Offertes">
          <Punt tekst="Maak een offerte aan via '+ Nieuw' in het offertes-scherm." />
          <Punt tekst="Voeg dezelfde regelitems toe als bij een factuur: omschrijving, aantal, prijs en BTW." />
          <Punt tekst="Verstuur de offerte als PDF naar uw klant." />
          <Punt tekst="Gaat de klant akkoord? Tik op 'Omzetten naar factuur' — de offerte wordt automatisch omgezet naar een factuur." />
          <Punt tekst="⚙️ Offertenummer instellen: tik op het tandwiel rechtsboven om het startnummer voor offertes in te stellen." />
          <Tip tekst="Offertes hebben een geldigheidsdatum. Na het verstrijken verandert de status automatisch naar 'Verlopen'." />
        </Sectie>

        <Sectie icoon="⏱️" titel="Urenregistratie">
          <Punt tekst="Timer starten: tik op 'Start timer' bij het begin van een klus. Stop de timer als u klaar bent — de uren worden automatisch opgeslagen." />
          <Punt tekst="Handmatig invoeren: voer datum, starttijd en eindtijd in. De duur wordt automatisch berekend." />
          <Punt tekst="Koppel uren aan een klant via de klant-selectie." />
          <Punt tekst="Factuur aanmaken van uren: selecteer een klant in de filterbalk bovenaan en tik op 'Factuur aanmaken'. Voer uw uurtarief in en de factuur wordt direct aangemaakt." />
          <Tip tekst="Gebruik de timer tijdens het werken voor de meest nauwkeurige urenregistratie. U kunt ook een omschrijving toevoegen zodat u later weet waar de uren voor waren." />
        </Sectie>

        <Sectie icoon="💰" titel="Inkomsten &amp; Uitgaven">
          <Punt tekst="Registreer hier alle zakelijke inkomsten en uitgaven die niet via een factuur lopen, zoals abonnementen, materiaalkosten of ontvangen betalingen." />
          <Punt tekst="Koppel altijd een BTW-tarief aan elke transactie — dit is nodig voor een correcte BTW-aangifte." />
          <Punt tekst="Kies de juiste categorie om uw rapportage overzichtelijk te houden." />
          <Punt tekst="Exporteer een PDF-overzicht voor een bepaalde periode via de exportknop rechtsboven." />
        </Sectie>

        <Sectie icoon="📊" titel="Rapportage">
          <Punt tekst="Bekijk uw omzet, kosten en nettoresultaat per maand, kwartaal of jaar." />
          <Punt tekst="Het BTW-overzicht toont precies hoeveel BTW u over de gekozen periode moet afdragen (21% en 9% gescheiden)." />
          <Punt tekst="Tik op een inkomsten- of uitgavencategorie om de bijbehorende transacties te bekijken." />
          <Punt tekst="Premium: exporteer een volledig rapport als PDF voor uw boekhouder." />
          <Tip tekst="Controleer de rapportage elke maand of elk kwartaal om uw BTW-aangifte voor te bereiden. De bedragen in het BTW-overzicht zijn de bedragen die u aan de Belastingdienst moet afdragen." />
        </Sectie>

        <Sectie icoon="👥" titel="Klanten">
          <Punt tekst="Sla uw klanten op via het klantenoverzicht in de facturen- of offertes-schermen." />
          <Punt tekst="Bij het aanmaken van een factuur of offerte kunt u een opgeslagen klant selecteren — alle gegevens worden dan automatisch ingevuld." />
          <Punt tekst="Klantgegevens worden niet automatisch bijgewerkt op bestaande facturen als u de klant later wijzigt." />
        </Sectie>

        <Sectie icoon="🆓" titel="Gratis vs Premium">
          <View style={s.vergelijkingKaart}>
            <View style={s.vergelijkingKolom}>
              <Text style={s.vergelijkingKolomTitel}>GRATIS</Text>
              <Punt tekst="Max. 2 facturen per maand" />
              <Punt tekst="Max. 10 transacties per maand" />
              <Punt tekst="Offertes bekijken" />
              <Punt tekst="Urenregistratie" />
              <Punt tekst="Rapportage bekijken" />
            </View>
            <View style={s.vergelijkingDivider} />
            <View style={s.vergelijkingKolom}>
              <Text style={s.vergelijkingKolomTitelPremium}>⭐ PREMIUM</Text>
              <Punt tekst="Onbeperkt facturen" />
              <Punt tekst="Onbeperkt transacties" />
              <Punt tekst="Offertes aanmaken & delen" />
              <Punt tekst="PDF exporteren & delen" />
              <Punt tekst="Creditnota's aanmaken" />
              <Punt tekst="Uren factureren" />
            </View>
          </View>
        </Sectie>

        <View style={s.footer}>
          <Text style={s.footerTekst}>Heeft u een vraag of een probleem?</Text>
          <Text style={s.footerOndertekst}>Neem contact op via de App Store-pagina van ZZPBox.</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  scherm: { flex: 1, backgroundColor: '#1A1A1A' },
  koptekst: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  terugTekst: { color: '#C9A84C', fontSize: 15, fontWeight: '600', width: 60 },
  koptekstTitel: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  inhoud: { padding: 20, paddingBottom: 60 },
  welkomKaart: { backgroundColor: '#1e1a0e', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#C9A84C33' },
  welkomIcoon: { fontSize: 40, marginBottom: 12 },
  welkomTitel: { color: '#C9A84C', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  welkomTekst: { color: '#aaa', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  sectie: { marginBottom: 24 },
  sectieKoptekst: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectieIcoon: { fontSize: 22 },
  sectieTitel: { color: '#ffffff', fontSize: 17, fontWeight: '800' },
  sectieInhoud: { backgroundColor: '#222', borderRadius: 14, padding: 16, gap: 10 },
  punt: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  puntBullet: { color: '#C9A84C', fontSize: 16, lineHeight: 22, marginTop: 1 },
  puntTekst: { color: '#ccc', fontSize: 14, lineHeight: 22, flex: 1 },
  stap: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stapNummer: { backgroundColor: '#FF6B00', borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center', marginTop: 1, flexShrink: 0 },
  stapNummerTekst: { color: '#1A1A1A', fontSize: 12, fontWeight: '800' },
  stapTekst: { color: '#ccc', fontSize: 14, lineHeight: 22, flex: 1 },
  tip: { flexDirection: 'row', gap: 8, backgroundColor: '#1e1a0e', borderRadius: 10, padding: 12, alignItems: 'flex-start', borderWidth: 1, borderColor: '#C9A84C22' },
  tipIcoon: { fontSize: 16, marginTop: 1 },
  tipTekst: { color: '#C9A84C', fontSize: 13, lineHeight: 20, flex: 1 },
  vergelijkingKaart: { flexDirection: 'row', gap: 12 },
  vergelijkingKolom: { flex: 1, gap: 8 },
  vergelijkingKolomTitel: { color: '#888', fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  vergelijkingKolomTitelPremium: { color: '#C9A84C', fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  vergelijkingDivider: { width: 1, backgroundColor: '#333' },
  footer: { alignItems: 'center', paddingTop: 16, gap: 4 },
  footerTekst: { color: '#555', fontSize: 13, fontWeight: '600' },
  footerOndertekst: { color: '#444', fontSize: 12, textAlign: 'center' },
});
