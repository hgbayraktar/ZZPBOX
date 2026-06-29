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

function Alinea({ tekst }: { tekst: string }) {
  return <Text style={s.alinea}>{tekst}</Text>;
}

function Stap({ nummer, titel, tekst }: { nummer: string; titel: string; tekst: string }) {
  return (
    <View style={s.stap}>
      <View style={s.stapNummer}>
        <Text style={s.stapNummerTekst}>{nummer}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.stapTitel}>{titel}</Text>
        <Text style={s.stapTekst}>{tekst}</Text>
      </View>
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

function Vergelijking({ links, rechts }: { links: string[]; rechts: string[] }) {
  return (
    <View style={s.vergelijking}>
      <View style={s.vergelijkingKolom}>
        <Text style={s.vergelijkingLabel}>GRATIS</Text>
        {links.map((t, i) => <Text key={i} style={s.vergelijkingRegel}>· {t}</Text>)}
      </View>
      <View style={s.vergelijkingDivider} />
      <View style={s.vergelijkingKolom}>
        <Text style={s.vergelijkingLabelPremium}>⭐ PREMIUM</Text>
        {rechts.map((t, i) => <Text key={i} style={s.vergelijkingRegelPremium}>· {t}</Text>)}
      </View>
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
          <Text style={s.welkomIcoon}>👋</Text>
          <Text style={s.welkomTitel}>Welkom bij ZZPBox!</Text>
          <Text style={s.welkomTekst}>
            Fijn dat u er bent. ZZPBox helpt u uw administratie bij te houden zonder gedoe — facturen sturen, uren bijhouden, inkomsten en uitgaven registreren. Alles op één plek, altijd bij de hand.{'\n\n'}Deze handleiding legt stap voor stap uit hoe het werkt. Geen technische taal, gewoon duidelijk.
          </Text>
        </View>

        <Sectie icoon="🚀" titel="Eerst dit doen — uw bedrijfsgegevens">
          <Alinea tekst="Voordat u uw eerste factuur verstuurt, is het slim om even uw bedrijfsgegevens in te vullen. Ga naar Instellingen (rechtsboven in het menu) en vul daar uw bedrijfsnaam, KvK-nummer, BTW-nummer en IBAN in." />
          <Alinea tekst="Waarom? Omdat al deze gegevens automatisch op elke factuur en offerte verschijnen. U hoeft ze maar één keer in te voeren." />
          <Tip tekst="Vergeet uw IBAN niet — dat is uw rekeningnummer en staat in het betalingsblok van uw factuur. Zonder IBAN weet uw klant niet waar hij naartoe moet betalen." />
        </Sectie>

        <Sectie icoon="📄" titel="Facturen versturen">
          <Alinea tekst="Tik op '+ Nieuw' om een factuur aan te maken. U kunt een bestaande klant selecteren of de gegevens gewoon handmatig invullen — wat voor u het makkelijkst werkt." />
          <Alinea tekst="Voeg uw werkzaamheden toe als regelitems: wat heeft u gedaan, hoeveel uur of stuks, wat is de prijs en welk BTW-tarief geldt er. ZZPBox rekent het totaal automatisch uit." />
          <Alinea tekst="Als de factuur klaar is, slaat u hem op als concept. Tik daarna op de deelknop om de PDF te versturen naar uw klant — via e-mail, WhatsApp, wat u maar wilt." />
          <Alinea tekst="Zodra de klant betaald heeft, zet u de status op 'Betaald'. Zo houdt u altijd overzicht van wat er nog openstaat." />
          <Tip tekst="Heeft u al facturen verstuurd vanuit een ander programma of Excel? Stel dan uw factuurnummer in via het ⚙️-icoon rechtsboven, zodat de nummering gewoon doorloopt. U hoeft niet opnieuw bij 1 te beginnen." />
        </Sectie>

        <Sectie icoon="↩" titel="Fout gemaakt? Creditnota aanmaken">
          <Alinea tekst="Het overkomt iedereen: een factuur die fout is of die u wilt annuleren. Open de betreffende factuur en tik op 'Creditnota aanmaken'. ZZPBox regelt de rest — de creditnota krijgt automatisch een eigen nummer en is gekoppeld aan de originele factuur." />
          <Alinea tekst="Een creditnota is in feite een 'negatieve factuur' waarmee u een eerder bedrag corrigeert. Uw boekhouder zal het waarderen dat dit netjes bijgehouden wordt." />
        </Sectie>

        <Sectie icoon="📋" titel="Offertes maken en omzetten">
          <Alinea tekst="Wil een klant eerst een prijsopgave? Maak een offerte aan via het Offertes-scherm. De opbouw is hetzelfde als een factuur: klantgegevens, werkzaamheden, prijs en BTW." />
          <Alinea tekst="Stuur de offerte als PDF naar uw klant. Gaat hij akkoord? Tik op 'Omzetten naar factuur' — ZZPBox maakt er direct een factuur van, inclusief alle gegevens. U hoeft niets opnieuw in te typen." />
          <Tip tekst="Net als bij facturen kunt u ook het startnummer van offertes zelf instellen via het ⚙️-icoon. Handig als u al eerder offertes heeft verstuurd." />
        </Sectie>

        <Sectie icoon="⏱️" titel="Uren bijhouden">
          <Alinea tekst="ZZPBox heeft een ingebouwde timer. Begint u aan een klus? Tik op 'Start timer'. Klaar? Tik op 'Stop'. De uren worden automatisch bijgehouden. U kunt ook achteraf uren handmatig invoeren als u de timer vergeten bent." />
          <Alinea tekst="Koppel uren aan een klant, zodat u altijd weet hoeveel tijd u per klant heeft besteed." />
          <Alinea tekst="Als u een project heeft afgerond, selecteert u de klant in de filterbalk bovenaan en tikt u op 'Factuur aanmaken'. Voer uw uurtarief in — en ZZPBox maakt de factuur voor u aan." />
          <Tip tekst="Voeg een korte omschrijving toe aan uw urenregistratie. Over een maand weet u anders niet meer waar die zes uur op donderdag voor waren." />
        </Sectie>

        <Sectie icoon="💰" titel="Inkomsten en uitgaven bijhouden">
          <Alinea tekst="Hier registreert u alle zakelijke inkomsten en uitgaven die niet via een factuur lopen. Denk aan een abonnement dat u betaalt, materiaalkosten, een zakelijke lunch of een ontvangen betaling die u handmatig wilt noteren." />
          <Alinea tekst="Vul altijd het BTW-tarief in — dit heeft u nodig voor uw BTW-aangifte. ZZPBox houdt het automatisch bij." />
          <Alinea tekst="Via de exportknop rechtsboven kunt u een overzicht als PDF exporteren voor een bepaalde periode. Handig om naar uw boekhouder te sturen." />
        </Sectie>

        <Sectie icoon="📊" titel="Rapportage en BTW">
          <Alinea tekst="In het Rapportage-scherm ziet u in één oogopslag hoe uw bedrijf ervoor staat: hoeveel u heeft verdiend, hoeveel u heeft uitgegeven en wat het nettoresultaat is." />
          <Alinea tekst="Het BTW-overzicht is extra handig: ZZPBox berekent automatisch hoeveel BTW u over de gekozen periode moet afdragen aan de Belastingdienst, opgesplitst in 21% en 9%." />
          <Alinea tekst="U kunt filteren op maand, kwartaal of jaar. Tik op een categorie om te zien welke transacties daaronder vallen." />
          <Tip tekst="Controleer de rapportage elke maand even — zo heeft u geen verrassingen bij uw kwartaalaangifte en weet u altijd hoeveel BTW u opzij moet zetten." />
        </Sectie>

        <Sectie icoon="👥" titel="Klanten opslaan">
          <Alinea tekst="U kunt klanten opslaan via het klantenscherm in facturen of offertes. De volgende keer dat u een factuur maakt, selecteert u gewoon de klant en worden alle gegevens automatisch ingevuld." />
          <Alinea tekst="Dit bespaart u veel tikwerk, zeker als u regelmatig voor dezelfde klanten werkt." />
        </Sectie>

        <Sectie icoon="🆓" titel="Gratis of Premium — wat is het verschil?">
          <Alinea tekst="ZZPBox is gratis te gebruiken. Met een Premium-abonnement heeft u toegang tot alle functies zonder beperkingen." />
          <Vergelijking
            links={[
              'Max. 2 facturen per maand',
              'Max. 10 transacties per maand',
              'Rapportage bekijken',
              'Urenregistratie',
              'Offertes bekijken',
            ]}
            rechts={[
              'Onbeperkt facturen',
              'Onbeperkt transacties',
              'Offertes aanmaken en delen',
              'PDF exporteren en delen',
              "Creditnota's aanmaken",
              'Uren factureren',
            ]}
          />
          <Tip tekst="Wilt u upgraden? Tik op 'Abonnement' in het menu. U kunt kiezen uit maandelijks, per kwartaal of per jaar." />
        </Sectie>

        <View style={s.footer}>
          <Text style={s.footerTekst}>Nog vragen?</Text>
          <Text style={s.footerOndertekst}>Laat een bericht achter via de App Store-pagina van ZZPBox. Wij helpen u graag verder.</Text>
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
  welkomKaart: { backgroundColor: '#1e1a0e', borderRadius: 16, padding: 24, marginBottom: 24, borderWidth: 1, borderColor: '#C9A84C33' },
  welkomIcoon: { fontSize: 36, marginBottom: 10 },
  welkomTitel: { color: '#C9A84C', fontSize: 20, fontWeight: '800', marginBottom: 10 },
  welkomTekst: { color: '#bbb', fontSize: 14, lineHeight: 22 },
  sectie: { marginBottom: 24 },
  sectieKoptekst: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectieIcoon: { fontSize: 22 },
  sectieTitel: { color: '#ffffff', fontSize: 17, fontWeight: '800' },
  sectieInhoud: { backgroundColor: '#222', borderRadius: 14, padding: 16, gap: 12 },
  alinea: { color: '#ccc', fontSize: 14, lineHeight: 22 },
  stap: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stapNummer: { backgroundColor: '#FF6B00', borderRadius: 12, width: 26, height: 26, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
  stapNummerTekst: { color: '#1A1A1A', fontSize: 12, fontWeight: '800' },
  stapTitel: { color: '#ffffff', fontSize: 14, fontWeight: '700', marginBottom: 3 },
  stapTekst: { color: '#ccc', fontSize: 14, lineHeight: 21 },
  tip: { flexDirection: 'row', gap: 10, backgroundColor: '#1e1a0e', borderRadius: 10, padding: 14, alignItems: 'flex-start', borderWidth: 1, borderColor: '#C9A84C22' },
  tipIcoon: { fontSize: 16, marginTop: 1 },
  tipTekst: { color: '#C9A84C', fontSize: 13, lineHeight: 20, flex: 1 },
  vergelijking: { flexDirection: 'row', gap: 12 },
  vergelijkingKolom: { flex: 1, gap: 6 },
  vergelijkingLabel: { color: '#666', fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  vergelijkingLabelPremium: { color: '#C9A84C', fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  vergelijkingRegel: { color: '#888', fontSize: 13, lineHeight: 20 },
  vergelijkingRegelPremium: { color: '#ccc', fontSize: 13, lineHeight: 20 },
  vergelijkingDivider: { width: 1, backgroundColor: '#333' },
  footer: { alignItems: 'center', paddingTop: 8, gap: 6 },
  footerTekst: { color: '#555', fontSize: 14, fontWeight: '700' },
  footerOndertekst: { color: '#444', fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
