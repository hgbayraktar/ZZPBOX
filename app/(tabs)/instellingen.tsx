import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { sendPasswordResetEmail, signOut } from 'firebase/auth';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet, Text,
  TouchableOpacity,
  View
} from 'react-native';
import { auth } from '../../constants/firebase';
import { gebruikGebruiker, gebruikPakket, gebruikTransacties } from '../../hooks/gebruikData';

export default function InstellingenScherm() {
  const router = useRouter();
  const { gebruiker } = gebruikGebruiker();
  const pakket = gebruikPakket();
  const { transacties } = gebruikTransacties();

  async function csvExporteren() {
    if (pakket !== 'premium') {
      Alert.alert('Premium functie', 'Gegevens exporteren is alleen beschikbaar in Premium.', [
        { text: 'Annuleren', style: 'cancel' },
        { text: 'Upgraden', onPress: () => router.push('/(tabs)/abonnement') }
      ]);
      return;
    }
    if (transacties.length === 0) {
      Alert.alert('Geen gegevens', 'Er zijn nog geen transacties om te exporteren.');
      return;
    }
    try {
      const koptekst = 'Datum;Omschrijving;Categorie;Soort;Bedrag;BTW\n';
      const rijen = transacties.map(t => {
        const bedrag = typeof t.bedrag === 'number' ? t.bedrag.toFixed(2).replace('.', ',') : '0,00';
        const btw = typeof t.btw === 'number' ? t.btw.toFixed(2).replace('.', ',') : '0,00';
        return `${t.datum || ''};${(t.omschrijving || '').replace(/;/g, ',')};${t.categorie || ''};${t.soort || ''};${bedrag};${btw}`;
      }).join('\n');
      const csvInhoud = koptekst + rijen;
      const bestandspad = FileSystem.documentDirectory + 'zzpbox_export.csv';
      await FileSystem.writeAsStringAsync(bestandspad, csvInhoud, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(bestandspad, { mimeType: 'text/csv', dialogTitle: 'Exporteer transacties' });
    } catch (e: any) {
      Alert.alert('Fout', e?.message || 'Kon gegevens niet exporteren.');
    }
  }

  async function meldingInplannen() {
    if (pakket !== 'premium') {
      Alert.alert('Premium functie', 'Herinneringen zijn alleen beschikbaar in Premium.', [
        { text: 'Annuleren', style: 'cancel' },
        { text: 'Upgraden', onPress: () => router.push('/(tabs)/abonnement') }
      ]);
      return;
    }
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Toestemming vereist', 'Sta meldingen toe in uw telefooninstellingen om herinneringen te ontvangen.');
      return;
    }
    await Notifications.cancelAllScheduledNotificationsAsync();

    // BTW-aangifte herinnering: elk kwartaal op de 25e van de maand na het kwartaal
    const nu = new Date();
    const kwartaalMaanden = [3, 6, 9, 12];
    for (const maand of kwartaalMaanden) {
      const datum = new Date(nu.getFullYear(), maand - 1, 25, 9, 0, 0);
      if (datum > nu) {
        await Notifications.scheduleNotificationAsync({
          content: { title: '📊 BTW-aangifte herinnering', body: 'Vergeet niet uw BTW-aangifte in te dienen via de Belastingdienst.' },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: datum },
        });
      }
    }

    Alert.alert('Herinneringen ingesteld', 'U ontvangt elk kwartaal een herinnering voor uw BTW-aangifte op de 25e.');
  }

  async function uitloggen() {
    Alert.alert('Uitloggen', 'Weet u zeker dat u wilt uitloggen?', [
      { text: 'Annuleren', style: 'cancel' },
      {
        text: 'Uitloggen', style: 'destructive', onPress: async () => {
          await signOut(auth);
          router.replace('/inloggen');
        }
      }
    ]);
  }

  function MenuItem({
    icoon, titel, ondertitel, onPress, kleur, badge, waarde
  }: {
    icoon: string;
    titel: string;
    ondertitel?: string;
    onPress: () => void;
    kleur?: string;
    badge?: string;
    waarde?: string;
  }) {
    return (
      <TouchableOpacity style={stijlen.menuItem} onPress={onPress} activeOpacity={0.7}>
        <View style={stijlen.menuLinks}>
          <Text style={stijlen.menuIcoon}>{icoon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[stijlen.menuTitel, kleur ? { color: kleur } : {}]}>{titel}</Text>
            {ondertitel ? <Text style={stijlen.menuOndertitel}>{ondertitel}</Text> : null}
          </View>
        </View>
        <View style={stijlen.menuRechts}>
          {waarde ? <Text style={stijlen.menuWaarde}>{waarde}</Text> : null}
          {badge ? <View style={stijlen.badge}><Text style={stijlen.badgeTekst}>{badge}</Text></View> : null}
          <Text style={stijlen.pijl}>›</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={stijlen.scherm}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />

      <View style={stijlen.koptekst}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={stijlen.terugTekst}>← Terug</Text>
        </TouchableOpacity>
        <Text style={stijlen.koptekstTitel}>Instellingen</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={stijlen.scrollInhoud}>

        {/* PROFIEL KAART */}
        <View style={stijlen.profielKaart}>
          <View style={stijlen.profielAvatar}>
            <Text style={stijlen.profielAvatarTekst}>
              {gebruiker?.email?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <View style={stijlen.profielInfo}>
            <Text style={stijlen.profielEmail}>{gebruiker?.email}</Text>
            <Text style={stijlen.profielUid}>ID: {gebruiker?.uid?.slice(0, 12)}...</Text>
            <View style={[stijlen.pakketBadge, pakket === 'premium' && stijlen.pakketBadgePremium]}>
              <Text style={stijlen.pakketTekst}>{pakket === 'premium' ? '⭐ PREMIUM' : 'GRATIS'}</Text>
            </View>
          </View>
        </View>

        {/* MIJN BEDRIJF */}
        <Text style={stijlen.sectieLabel}>MIJN BEDRIJF</Text>
        <View style={stijlen.sectieKaart}>
          <MenuItem
            icoon="🏢"
            titel="Bedrijfsgegevens"
            ondertitel="Naam, adres, KvK, BTW-nummer"
            onPress={() => router.push('/(tabs)/mijnbedrijf')}
          />
          <View style={stijlen.scheidingslijn} />
          <MenuItem
            icoon="👥"
            titel="Klanten"
            ondertitel="Klantenbeheer"
            onPress={() => router.push('/(tabs)/klanten')}
          />
          <View style={stijlen.scheidingslijn} />
          <MenuItem
            icoon="📦"
            titel="Producten & Diensten"
            ondertitel="Prijslijst beheren"
            onPress={() => router.push('/(tabs)/producten')}
          />
          <View style={stijlen.scheidingslijn} />
          <MenuItem
            icoon="🗂️"
            titel="Categorieen"
            ondertitel="Inkomsten & uitgavencategorieen beheren"
            onPress={() => router.push('/(tabs)/categorieen')}
          />
          <View style={stijlen.scheidingslijn} />
          <MenuItem
            icoon="📄"
            titel="Facturen"
            ondertitel="Factuuroverzicht en beheer"
            onPress={() => router.push('/(tabs)/facturen')}
          />
          <View style={stijlen.scheidingslijn} />
          <MenuItem
            icoon="📊"
            titel="Rapportage"
            ondertitel="Financieel overzicht & BTW"
            onPress={() => router.push('/(tabs)/rapportage')}
          />
        </View>

        {/* ABONNEMENT */}
        <Text style={stijlen.sectieLabel}>ABONNEMENT</Text>
        <View style={stijlen.sectieKaart}>
          <MenuItem
            icoon="⚡"
            titel={pakket === 'premium' ? 'Premium actief' : 'Upgraden naar Premium'}
            ondertitel={pakket === 'premium'
              ? 'Alle functies ontgrendeld — Facturen, PDF, onbeperkt'
              : 'Facturen, PDF exporteren, onbeperkt invoeren'}
            onPress={() => router.push('/(tabs)/abonnement')}
            badge={pakket === 'gratis' ? 'UPGRADE' : undefined}
          />
        </View>

        {/* BEVEILIGING */}
        <Text style={stijlen.sectieLabel}>BEVEILIGING</Text>
        <View style={stijlen.sectieKaart}>
          <MenuItem
            icoon="🔑"
            titel="E-mailadres"
            ondertitel="Inloggegevens wijzigen"
            waarde={gebruiker?.email?.split('@')[0] + '...'}
            onPress={() => Alert.alert('E-mail wijzigen', 'Stuur een e-mail naar support@zzpbox.nl om uw e-mailadres te wijzigen.')}
          />
          <View style={stijlen.scheidingslijn} />
          <MenuItem
            icoon="🔐"
            titel="Wachtwoord wijzigen"
            ondertitel="Nieuw wachtwoord instellen"
            onPress={() => Alert.alert('Wachtwoord wijzigen', 'Er wordt een resetlink gestuurd naar uw e-mailadres.', [
              { text: 'Annuleren', style: 'cancel' },
              { text: 'Versturen', onPress: async () => { try { await sendPasswordResetEmail(auth, gebruiker?.email || ''); Alert.alert('Verstuurd', 'Controleer uw inbox.'); } catch { Alert.alert('Fout', 'Kon e-mail niet versturen.'); } } }
            ])}
          />
        </View>

        {/* MELDINGEN */}
        <Text style={stijlen.sectieLabel}>MELDINGEN</Text>
        <View style={stijlen.sectieKaart}>
          <MenuItem
            icoon="🔔"
            titel="Herinneringen"
            ondertitel="BTW-aangifte en betaalherinneringen"
            onPress={meldingInplannen}
            badge={pakket !== 'premium' ? 'PREMIUM' : undefined}
          />
        </View>

        {/* GEGEVENS */}
        <Text style={stijlen.sectieLabel}>GEGEVENS</Text>
        <View style={stijlen.sectieKaart}>
          <MenuItem
            icoon="📤"
            titel="Gegevens exporteren"
            ondertitel="Alle transacties exporteren als CSV"
            onPress={csvExporteren}
            badge={pakket !== 'premium' ? 'PREMIUM' : undefined}
          />
          <View style={stijlen.scheidingslijn} />
          <MenuItem
            icoon="🗑️"
            titel="Account verwijderen"
            ondertitel="Alle gegevens permanent wissen"
            onPress={() => Alert.alert(
              'Account verwijderen',
              'Weet u zeker dat u uw account en alle gegevens wilt verwijderen? Dit kan niet ongedaan worden gemaakt.',
              [
                { text: 'Annuleren', style: 'cancel' },
                { text: 'Verwijderen', style: 'destructive', onPress: () => Alert.alert('Neem contact op', 'Stuur een e-mail naar support@zzpbox.nl om uw account te verwijderen.') }
              ]
            )}
            kleur="#f44336"
          />
        </View>

        {/* SUPPORT */}
        <Text style={stijlen.sectieLabel}>SUPPORT</Text>
        <View style={stijlen.sectieKaart}>
          <MenuItem
            icoon="💬"
            titel="Hulp & Ondersteuning"
            ondertitel="Veelgestelde vragen en contact"
            onPress={() => Alert.alert('Support', 'Neem contact op via support@zzpbox.nl')}
          />
          <View style={stijlen.scheidingslijn} />
          <MenuItem
            icoon="⭐"
            titel="Beoordeel de app"
            ondertitel="Geef uw mening in de App Store"
            onPress={() => Alert.alert('Beoordelen', 'Bedankt! U wordt doorgestuurd naar de App Store.')}
          />
          <View style={stijlen.scheidingslijn} />
          <MenuItem
            icoon="🐛"
            titel="Fout melden"
            ondertitel="Bug rapporteren via e-mail"
            onPress={() => Alert.alert('Fout melden', 'Stuur een beschrijving naar support@zzpbox.nl')}
          />
        </View>

        {/* JURIDISCH */}
        <Text style={stijlen.sectieLabel}>JURIDISCH</Text>
        <View style={stijlen.sectieKaart}>
          <MenuItem
            icoon="📄"
            titel="Algemene voorwaarden"
            onPress={() => router.push('/voorwaarden')}
          />
          <View style={stijlen.scheidingslijn} />
          <MenuItem
            icoon="🔒"
            titel="Privacybeleid"
            onPress={() => router.push('/privacybeleid')}
          />
        </View>

        {/* UITLOGGEN */}
        <Text style={stijlen.sectieLabel}>ACCOUNT</Text>
        <View style={stijlen.sectieKaart}>
          <MenuItem
            icoon="🚪"
            titel="Uitloggen"
            ondertitel={gebruiker?.email || ''}
            onPress={uitloggen}
            kleur="#f44336"
          />
        </View>

        <Text style={stijlen.versie}>ZZPBox v1.0.0</Text>
        <Text style={stijlen.slogan}>Slim boekhouden voor de zelfstandige</Text>

      </ScrollView>
    </View>
  );
}

const stijlen = StyleSheet.create({
  scherm: { flex: 1, backgroundColor: '#1A1A1A' },
  koptekst: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  terugTekst: { color: '#C9A84C', fontSize: 15, fontWeight: '600' },
  koptekstTitel: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  scrollInhoud: { padding: 20, paddingBottom: 60 },
  profielKaart: { backgroundColor: '#242424', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 28, borderWidth: 1, borderColor: '#2a2a2a' },
  profielAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#003DA5', alignItems: 'center', justifyContent: 'center' },
  profielAvatarTekst: { color: '#ffffff', fontSize: 26, fontWeight: '800' },
  profielInfo: { flex: 1, gap: 6 },
  profielEmail: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  profielUid: { color: '#444', fontSize: 11 },
  pakketBadge: { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  pakketBadgePremium: { backgroundColor: '#1e1a0e', borderColor: '#C9A84C' },
  pakketTekst: { color: '#C9A84C', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  sectieLabel: { color: '#555', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8, marginLeft: 4 },
  sectieKaart: { backgroundColor: '#242424', borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#2a2a2a', overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  menuLinks: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  menuIcoon: { fontSize: 22 },
  menuTitel: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  menuOndertitel: { color: '#555', fontSize: 12, marginTop: 2 },
  menuRechts: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuWaarde: { color: '#666', fontSize: 13 },
  badge: { backgroundColor: '#FF6B00', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeTekst: { color: '#1A1A1A', fontSize: 10, fontWeight: '800' },
  pijl: { color: '#444', fontSize: 20 },
  scheidingslijn: { height: 1, backgroundColor: '#2a2a2a', marginLeft: 52 },
  versie: { color: '#444', fontSize: 12, textAlign: 'center', marginTop: 16 },
  slogan: { color: '#333', fontSize: 11, textAlign: 'center', marginTop: 4, marginBottom: 8 },
});