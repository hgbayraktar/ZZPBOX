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

function Subkop({ tekst }: { tekst: string }) {
  return <Text style={s.subkop}>{tekst}</Text>;
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

function Waarschuwing({ tekst }: { tekst: string }) {
  return (
    <View style={s.waarschuwing}>
      <Text style={s.waarschuwingIcoon}>⚠️</Text>
      <Text style={s.waarschuwingTekst}>{tekst}</Text>
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
            ZZPBox helpt u uw administratie bijhouden zonder gedoe — facturen sturen, uren bijhouden, inkomsten en uitgaven registreren. Alles op één plek.{'\n\n'}
            Deze handleiding legt stap voor stap uit hoe alles werkt. Begin bovenaan of sla door naar het onderdeel dat u nodig heeft.
          </Text>
        </View>

        {/* ─── BEDRIJFSGEGEVENS ─── */}
        <Sectie icoon="🏢" titel="Stap 1 — Eerst uw bedrijfsgegevens invullen">
          <Text style={s.intro}>Dit is het allereerste wat u moet doen. Uw gegevens verschijnen automatisch op elke factuur en offerte.</Text>
          <Stap nummer="1" titel="Open Instellingen" tekst="Tik op het tabblad 'Instellingen' rechtsonder in het menu." />
          <Stap nummer="2" titel="Tik op 'Bedrijfsprofiel'" tekst="Bovenaan het scherm ziet u uw bedrijfsnaam staan. Tik erop om te bewerken." />
          <Stap nummer="3" titel="Vul uw bedrijfsnaam in" tekst="Precies zoals die op uw KvK-inschrijving staat." />
          <Stap nummer="4" titel="Vul uw KvK-nummer in" tekst="8 cijfers. U vindt dit op kvk.nl of op uw KvK-uittreksel." />
          <Stap nummer="5" titel="Vul uw BTW-nummer in" tekst="Bijv. NL123456789B01. Staat op uw belastingbrief van de Belastingdienst." />
          <Stap nummer="6" titel="Vul uw IBAN in" tekst="Uw zakelijke rekeningnummer, bijv. NL12 ABCD 0123 4567 89. Staat in het betalingsblok van de factuur." />
          <Stap nummer="7" titel="Adres, e-mail en website (optioneel)" tekst="Worden ook op de factuur getoond. Vul in wat u wilt laten zien aan klanten." />
          <Stap nummer="8" titel="Tik op 'Opslaan'" tekst="Klaar. Vanaf nu worden al deze gegevens automatisch op elke factuur en offerte gezet." />
          <Tip tekst="Vergeet uw IBAN niet — zonder rekeningnummer weet uw klant niet waar hij naartoe moet betalen." />
        </Sectie>

        {/* ─── FACTUREN ─── */}
        <Sectie icoon="📄" titel="Facturen aanmaken en versturen">
          <Waarschuwing tekst="Facturen aanmaken is een Premium-functie. Met Gratis kunt u facturen bekijken maar niet aanmaken of delen." />

          <Subkop tekst="Een nieuwe factuur aanmaken" />
          <Stap nummer="1" titel="Tik op 'Facturen' in het menu" tekst="Het factuuroverzicht opent. Hier ziet u alle concepten, openstaande en betaalde facturen." />
          <Stap nummer="2" titel="Tik op '+ Nieuwe factuur'" tekst="Rechtsboven in het scherm." />
          <Stap nummer="3" titel="Selecteer een klant of vul handmatig in" tekst="Heeft u de klant al opgeslagen? Tik op 'Selecteer klant' en kies uit de lijst. Zo niet, vul de naam direct in." />
          <Stap nummer="4" titel="Tik op '+ Regel toevoegen'" tekst="Voor elke werkzaamheid of product voegt u een aparte regel toe." />
          <Stap nummer="5" titel="Vul de regelgegevens in" tekst="Omschrijving (bijv. 'Websiteontwerp'), aantal (bijv. 1 of 4,5 voor uren), eenheid (bijv. 'stuks' of 'uur') en prijs per stuk." />
          <Stap nummer="6" titel="Kies het BTW-tarief" tekst="0% (geen BTW), 9% (bijv. voedsel/boeken) of 21% (standaard). Twijfel? Gebruik 21%." />
          <Stap nummer="7" titel="Herhaal voor meerdere regels" tekst="Tik opnieuw op '+ Regel toevoegen' voor elke extra post." />
          <Stap nummer="8" titel="Controleer het totaal" tekst="ZZPBox berekent het subtotaal, BTW en eindtotaal automatisch onderaan." />
          <Stap nummer="9" titel="Tik op 'Opslaan'" tekst="De factuur wordt opgeslagen. U kunt hem later nog bewerken zolang hij de status 'Concept' heeft." />

          <Subkop tekst="Factuur versturen" />
          <Stap nummer="10" titel="Open de factuur" tekst="Tik op de factuur in het overzicht." />
          <Stap nummer="11" titel="Tik op de deelknop (rechtsboven)" tekst="ZZPBox genereert de PDF. Dit duurt een paar seconden." />
          <Stap nummer="12" titel="Kies hoe u wilt delen" tekst="Via WhatsApp, e-mail, AirDrop — wat uw klant het liefst heeft. Het deelscherm van uw telefoon opent automatisch." />

          <Subkop tekst="Betaling registreren" />
          <Stap nummer="13" titel="Open de betaalde factuur" tekst="Tik op de factuur in het overzicht." />
          <Stap nummer="14" titel="Tik op 'Status wijzigen' → 'Betaald'" tekst="De factuur verschuift naar 'Betaald' en uw openstaand saldo klopt weer." />

          <Tip tekst="Heeft u al facturen verstuurd vanuit Excel of een ander programma? Stel dan uw startnummer in via het ⚙️-icoon rechtsboven — zo loopt de nummering gewoon door." />
        </Sectie>

        {/* ─── CREDITNOTA ─── */}
        <Sectie icoon="↩️" titel="Fout gemaakt? Creditnota aanmaken">
          <Waarschuwing tekst="Creditnota's aanmaken is een Premium-functie." />
          <Text style={s.intro}>Een creditnota is een negatieve factuur waarmee u een eerder bedrag volledig of gedeeltelijk corrigeert. Handig als u een factuur wilt annuleren of een fout wilt rechtzetten.</Text>
          <Stap nummer="1" titel="Open de betreffende factuur" tekst="Tik op de factuur in het overzicht waarop de fout staat." />
          <Stap nummer="2" titel="Tik op 'Creditnota aanmaken'" tekst="Onderaan het factuurdetailscherm." />
          <Stap nummer="3" titel="Controleer de gegevens" tekst="ZZPBox vult alles automatisch in — hetzelfde bedrag, negatief. Het creditnotanummer wordt CN-[factuurnummer], bijv. CN-6359." />
          <Stap nummer="4" titel="Tik op 'Opslaan'" tekst="De creditnota is aangemaakt en gekoppeld aan de originele factuur." />
          <Stap nummer="5" titel="Stuur de creditnota naar uw klant" tekst="Tik op de deelknop en stuur de PDF, net als bij een gewone factuur." />
          <Tip tekst="Uw boekhouder ziet graag dat creditnota's netjes bijgehouden worden. ZZPBox doet dit automatisch — u hoeft niks handmatig te corrigeren." />
        </Sectie>

        {/* ─── OFFERTES ─── */}
        <Sectie icoon="📋" titel="Offertes maken en omzetten naar factuur">
          <Waarschuwing tekst="Offertes aanmaken en omzetten naar factuur is een Premium-functie." />

          <Subkop tekst="Een offerte aanmaken" />
          <Stap nummer="1" titel="Tik op 'Offertes' in het menu" tekst="Het offerteoverzicht opent." />
          <Stap nummer="2" titel="Tik op '+ Nieuwe offerte'" tekst="Rechtsboven." />
          <Stap nummer="3" titel="Selecteer klant of vul handmatig in" tekst="Net als bij een factuur." />
          <Stap nummer="4" titel="Voeg regels toe" tekst="Zelfde werking als bij een factuur: omschrijving, aantal, prijs, BTW-tarief." />
          <Stap nummer="5" titel="Tik op 'Opslaan'" tekst="Offerte is klaar als concept." />
          <Stap nummer="6" titel="Stuur de offerte naar uw klant" tekst="Tik op de deelknop → PDF wordt gegenereerd → deel via WhatsApp, e-mail, etc." />

          <Subkop tekst="Offerte omzetten naar factuur" />
          <Stap nummer="7" titel="Klant gaat akkoord" tekst="Open de betreffende offerte in het overzicht." />
          <Stap nummer="8" titel="Tik op 'Omzetten naar factuur'" tekst="Onderaan het detailscherm." />
          <Stap nummer="9" titel="Controleer en sla op" tekst="ZZPBox maakt automatisch een factuur met alle gegevens van de offerte. U hoeft niets opnieuw in te typen." />
          <Tip tekst="Net als bij facturen kunt u het startnummer van offertes instellen via het ⚙️-icoon. Handig als u al eerder offertes heeft verstuurd." />
        </Sectie>

        {/* ─── UREN ─── */}
        <Sectie icoon="⏱️" titel="Uren bijhouden en factureren">
          <Waarschuwing tekst="Urenregistratie en uren factureren is een Premium-functie." />

          <Subkop tekst="Uren bijhouden met de timer" />
          <Stap nummer="1" titel="Tik op 'Uren' in het menu" tekst="Het urenoverzicht opent." />
          <Stap nummer="2" titel="Tik op 'Start timer'" tekst="De timer begint te lopen. U kunt de app gewoon afsluiten — de timer loopt door." />
          <Stap nummer="3" titel="Tik op 'Stop' als u klaar bent" tekst="De uren worden automatisch berekend en opgeslagen." />
          <Stap nummer="4" titel="Koppel aan een klant (optioneel)" tekst="Voeg een omschrijving en klantnaam toe zodat u later weet voor wie het was." />

          <Subkop tekst="Uren handmatig invoeren" />
          <Stap nummer="5" titel="Tik op 'Handmatig invoeren'" tekst="Rechts bovenaan het scherm." />
          <Stap nummer="6" titel="Vul starttijd en eindtijd in" tekst="Bijv. 09:00 – 12:30. ZZPBox berekent de duur automatisch." />
          <Stap nummer="7" titel="Voeg omschrijving en klant toe" tekst="Optioneel maar handig voor later." />
          <Stap nummer="8" titel="Tik op 'Opslaan'" tekst="De uren staan in het overzicht." />

          <Subkop tekst="Uren omzetten naar factuur" />
          <Stap nummer="9" titel="Filter op klant" tekst="Tik op de filterbalk bovenaan en selecteer de klant voor wie u wilt factureren." />
          <Stap nummer="10" titel="Tik op 'Factuur aanmaken'" tekst="Rechtsboven. Alle uren van die klant worden samengevoegd." />
          <Stap nummer="11" titel="Voer uw uurtarief in" tekst="Bijv. 85,00. ZZPBox berekent het totaal automatisch." />
          <Stap nummer="12" titel="Tik op 'Aanmaken'" tekst="De factuur is klaar. U vindt hem terug onder Facturen." />
          <Tip tekst="Voeg altijd een korte omschrijving toe bij uw uren. Over een maand weet u anders niet meer waar die vier uur op dinsdagochtend voor waren." />
        </Sectie>

        {/* ─── INKOMSTEN ─── */}
        <Sectie icoon="💰" titel="Inkomsten en uitgaven registreren">
          <Text style={s.intro}>Hier registreert u alles wat niet via een factuur loopt — denk aan een software-abonnement, materiaalkosten, een zakelijke lunch of een directe betaling van een klant.</Text>

          <Subkop tekst="Een inkomst of uitgave invoeren" />
          <Stap nummer="1" titel="Tik op 'Inkomsten' in het menu" tekst="Het overzicht van al uw inkomsten en uitgaven opent." />
          <Stap nummer="2" titel="Tik op '+ Inkomst' of '+ Uitgave'" tekst="Kies het type dat van toepassing is. Bij twijfel: geld dat binnenkomt = inkomst, geld dat uitgaat = uitgave." />
          <Stap nummer="3" titel="Vul een omschrijving in" tekst="Bijv. 'Materiaalkosten project X' of 'Abonnement Adobe'." />
          <Stap nummer="4" titel="Vul het bedrag in" tekst="Altijd het bedrag excl. BTW invullen, bijv. 99,50." />
          <Stap nummer="5" titel="Kies een categorie" tekst="Bijv. 'Kantoorkosten', 'Reiskosten', 'Omzet'. Categorieën helpen bij uw rapportage." />
          <Stap nummer="6" titel="Kies het BTW-tarief" tekst="0%, 9% of 21%. Dit heeft u nodig voor uw BTW-aangifte. Vul het altijd in." />
          <Stap nummer="7" titel="Controleer de datum" tekst="Standaard is dit vandaag. Tik erop als u een andere datum wilt invoeren." />
          <Stap nummer="8" titel="Tik op 'Opslaan'" tekst="De transactie staat in het overzicht en telt mee in uw rapportage." />
          <Tip tekst="Met Gratis kunt u max. 3 transacties per dag en 20 per maand invoeren. Wilt u onbeperkt invoeren? Upgrade naar Premium." />
        </Sectie>

        {/* ─── RAPPORTAGE ─── */}
        <Sectie icoon="📊" titel="Rapportage en BTW-overzicht">
          <Text style={s.intro}>Het Rapportage-scherm laat zien hoe uw bedrijf ervoor staat. Handig voor uw kwartaalaangifte bij de Belastingdienst.</Text>
          <Stap nummer="1" titel="Tik op 'Rapportage' in het menu" tekst="Het overzichtsscherm opent met inkomsten, uitgaven en resultaat." />
          <Stap nummer="2" titel="Kies uw periode" tekst="Bovenaan kunt u schakelen tussen maand, kwartaal en jaar. Tik op de pijltjes om naar een andere periode te bladeren." />
          <Stap nummer="3" titel="Bekijk uw omzet en kosten" tekst="Totale inkomsten minus uitgaven = uw nettoresultaat over de gekozen periode." />
          <Stap nummer="4" titel="Scroll naar het BTW-overzicht" tekst="ZZPBox berekent hoeveel BTW u moet afdragen: opgesplitst in 21% en 9%. Dit bedrag vult u in bij uw BTW-aangifte." />
          <Stap nummer="5" titel="Tik op een categorie voor details" tekst="U ziet welke transacties daaronder vallen." />
          <Stap nummer="6" titel="Exporteer als PDF" tekst="Tik op de exportknop rechtsboven om het rapport te delen met uw boekhouder." />
          <Tip tekst="Controleer de rapportage elke maand even. Zo heeft u geen verrassingen bij uw kwartaalaangifte en weet u precies hoeveel BTW u opzij moet zetten." />
        </Sectie>

        {/* ─── KLANTEN ─── */}
        <Sectie icoon="👥" titel="Klanten opslaan en beheren">
          <Text style={s.intro}>Door klanten op te slaan, hoeft u hun gegevens maar één keer in te voeren. Bij de volgende factuur of offerte kiest u ze gewoon uit de lijst.</Text>
          <Stap nummer="1" titel="Open een nieuwe factuur of offerte" tekst="Tik op '+ Nieuwe factuur' of '+ Nieuwe offerte'." />
          <Stap nummer="2" titel="Tik op 'Selecteer klant'" tekst="Bovenaan het formulier." />
          <Stap nummer="3" titel="Tik op '+ Nieuwe klant toevoegen'" tekst="Als de klant er nog niet tussen staat." />
          <Stap nummer="4" titel="Vul de klantgegevens in" tekst="Naam, adres, e-mailadres. Bedrijfsnaam en KvK/BTW-nummer zijn optioneel." />
          <Stap nummer="5" titel="Tik op 'Opslaan'" tekst="De klant is opgeslagen. Volgende keer staat hij direct in de lijst." />
          <Tip tekst="Met Gratis kunt u max. 3 klanten opslaan. Met Premium is dit onbeperkt." />
        </Sectie>

        {/* ─── PRODUCTEN ─── */}
        <Sectie icoon="📦" titel="Producten en diensten opslaan">
          <Text style={s.intro}>Verkoopt u steeds dezelfde diensten of producten? Sla ze op, dan hoeft u de omschrijving, prijs en BTW-tarief niet elke keer opnieuw in te typen.</Text>
          <Stap nummer="1" titel="Open een nieuwe factuur" tekst="Tik op '+ Nieuw factuur'." />
          <Stap nummer="2" titel="Voeg een regel toe" tekst="Tik op '+ Regel toevoegen'." />
          <Stap nummer="3" titel="Tik op het bladericoon (rechtsboven in de regelinvoer)" tekst="Een lijst van opgeslagen producten/diensten opent." />
          <Stap nummer="4" titel="Selecteer een product of tik op '+'" tekst="Om een nieuw product op te slaan: vul de gegevens in en sla op. Voortaan staat het in uw lijst." />
          <Tip tekst="Met Gratis kunt u max. 5 producten opslaan. Met Premium onbeperkt." />
        </Sectie>

        {/* ─── GRATIS VS PREMIUM ─── */}
        <Sectie icoon="🆓" titel="Gratis of Premium — wat is het verschil?">
          <Text style={s.intro}>ZZPBox is gratis te gebruiken. Met Premium heeft u toegang tot alle functies zonder beperkingen.</Text>
          <Vergelijking
            links={[
              'Max. 3 transacties per dag',
              'Max. 20 transacties per maand',
              'Max. 3 klanten opslaan',
              'Max. 5 producten opslaan',
              'Rapportage bekijken',
              'Facturen/offertes bekijken',
            ]}
            rechts={[
              'Onbeperkt transacties',
              'Onbeperkt klanten',
              'Onbeperkt producten',
              'Facturen aanmaken & delen',
              'Offertes aanmaken & delen',
              "Creditnota's aanmaken",
              'Uren bijhouden & factureren',
              'PDF exporteren & delen',
              'Geen advertenties',
            ]}
          />
          <Stap nummer="1" titel="Tik op 'Abonnement' in het menu" tekst="Rechtsonder in het tabblad." />
          <Stap nummer="2" titel="Kies uw abonnement" tekst="Maandelijks (€7,99), per kwartaal (€19,99 — 17% korting) of jaarlijks (€69,99 — 27% korting)." />
          <Stap nummer="3" titel="Tik op 'Nu upgraden naar Premium'" tekst="Betaling verloopt via App Store. U kunt op elk moment opzeggen via uw iPhone-instellingen." />
          <Tip tekst="Al eerder betaald maar werkt het niet? Tik op 'Aankopen herstellen' op het abonnementenscherm. Uw aankoop wordt hersteld zonder opnieuw te betalen." />
        </Sectie>

        <View style={s.footer}>
          <Text style={s.footerTekst}>Nog vragen?</Text>
          <Text style={s.footerOndertekst}>Stuur een bericht naar support@zzpbox.nl of laat een review achter in de App Store. Wij helpen u graag verder.</Text>
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
  intro: { color: '#aaa', fontSize: 13, lineHeight: 20, fontStyle: 'italic' },
  subkop: { color: '#C9A84C', fontSize: 13, fontWeight: '800', letterSpacing: 0.5, marginTop: 4 },
  stap: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stapNummer: { backgroundColor: '#FF6B00', borderRadius: 12, width: 26, height: 26, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
  stapNummerTekst: { color: '#1A1A1A', fontSize: 12, fontWeight: '800' },
  stapTitel: { color: '#ffffff', fontSize: 14, fontWeight: '700', marginBottom: 3 },
  stapTekst: { color: '#ccc', fontSize: 14, lineHeight: 21 },
  tip: { flexDirection: 'row', gap: 10, backgroundColor: '#1e1a0e', borderRadius: 10, padding: 14, alignItems: 'flex-start', borderWidth: 1, borderColor: '#C9A84C22' },
  tipIcoon: { fontSize: 16, marginTop: 1 },
  tipTekst: { color: '#C9A84C', fontSize: 13, lineHeight: 20, flex: 1 },
  waarschuwing: { flexDirection: 'row', gap: 10, backgroundColor: '#2a1a0e', borderRadius: 10, padding: 14, alignItems: 'flex-start', borderWidth: 1, borderColor: '#FF6B0044' },
  waarschuwingIcoon: { fontSize: 16, marginTop: 1 },
  waarschuwingTekst: { color: '#FF6B00', fontSize: 13, lineHeight: 20, flex: 1, fontWeight: '600' },
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
