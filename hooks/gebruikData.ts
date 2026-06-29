import { addDoc, collection, deleteDoc, doc, onSnapshot, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { db } from '../constants/firebase';
import { useAuth } from './AuthContext';
import type { Bedrijf, Categorie, Factuur, Klant, Offerte, Product, Transactie, UrenRegistratie } from '../types';

const STANDAARD_CATEGORIEEN = [
  // INKOMSTEN
  { naam: 'Omzet diensten', soort: 'inkomst', icoon: '🛠️', kleur: '#4CAF50', bovenliggend: null, volgorde: 1 },
  { naam: 'Omzet producten', soort: 'inkomst', icoon: '📦', kleur: '#4CAF50', bovenliggend: null, volgorde: 2 },
  { naam: 'Overige inkomsten', soort: 'inkomst', icoon: '💰', kleur: '#4CAF50', bovenliggend: null, volgorde: 3 },

  // UITGAVEN HOOFDCATEGORIEËN
  { naam: 'Huisvestingskosten', soort: 'uitgave', icoon: '🏠', kleur: '#FF6B00', bovenliggend: null, volgorde: 1 },
  { naam: 'Vervoerskosten', soort: 'uitgave', icoon: '🚗', kleur: '#FF6B00', bovenliggend: null, volgorde: 2 },
  { naam: 'Personeelskosten', soort: 'uitgave', icoon: '👥', kleur: '#FF6B00', bovenliggend: null, volgorde: 3 },
  { naam: 'Marketingkosten', soort: 'uitgave', icoon: '📣', kleur: '#FF6B00', bovenliggend: null, volgorde: 4 },
  { naam: 'Kantoorkosten', soort: 'uitgave', icoon: '🖥️', kleur: '#FF6B00', bovenliggend: null, volgorde: 5 },
  { naam: 'Financiële kosten', soort: 'uitgave', icoon: '🏦', kleur: '#FF6B00', bovenliggend: null, volgorde: 6 },
  { naam: 'Professionele diensten', soort: 'uitgave', icoon: '📊', kleur: '#FF6B00', bovenliggend: null, volgorde: 7 },
  { naam: 'Inkoop', soort: 'uitgave', icoon: '🛒', kleur: '#FF6B00', bovenliggend: null, volgorde: 8 },
  { naam: 'Overige kosten', soort: 'uitgave', icoon: '📎', kleur: '#FF6B00', bovenliggend: null, volgorde: 9 },
];

const STANDAARD_SUBCATEGORIEEN: Record<string, { naam: string; icoon: string }[]> = {
  'Huisvestingskosten': [
    { naam: 'Huur', icoon: '🏠' },
    { naam: 'Gas, Water & Elektriciteit', icoon: '💡' },
    { naam: 'Onderhoud & Reparatie', icoon: '🔧' },
    { naam: 'Schoonmaak', icoon: '🧹' },
  ],
  'Vervoerskosten': [
    { naam: 'Brandstof', icoon: '⛽' },
    { naam: 'Openbaar vervoer', icoon: '🚆' },
    { naam: 'Parkeerkosten', icoon: '🅿️' },
    { naam: 'Leasekosten', icoon: '🚘' },
    { naam: 'Kilometervergoeding', icoon: '📍' },
  ],
  'Personeelskosten': [
    { naam: 'Salarissen', icoon: '💼' },
    { naam: 'Ingehuurde ZZP\'ers', icoon: '🤝' },
    { naam: 'Opleidingen & Cursussen', icoon: '🎓' },
    { naam: 'Arbeidskosten', icoon: '👷' },
  ],
  'Marketingkosten': [
    { naam: 'Online advertenties', icoon: '📱' },
    { naam: 'Website & Hosting', icoon: '🌐' },
    { naam: 'Drukwerk & Materialen', icoon: '🖨️' },
    { naam: 'Beurzen & Evenementen', icoon: '🎪' },
  ],
  'Kantoorkosten': [
    { naam: 'Kantoorbenodigdheden', icoon: '📝' },
    { naam: 'Software & Licenties', icoon: '💻' },
    { naam: 'Telefoon & Internet', icoon: '📞' },
    { naam: 'Porti & Verzending', icoon: '📮' },
  ],
  'Financiële kosten': [
    { naam: 'Bankkosten', icoon: '🏦' },
    { naam: 'Rente & Financiering', icoon: '📈' },
    { naam: 'Verzekeringen', icoon: '🛡️' },
    { naam: 'Belastingen & Heffingen', icoon: '🏛️' },
  ],
  'Professionele diensten': [
    { naam: 'Accountant & Boekhouder', icoon: '📋' },
    { naam: 'Juridisch advies', icoon: '⚖️' },
    { naam: 'Consultancy', icoon: '💡' },
    { naam: 'Notariskosten', icoon: '📜' },
  ],
  'Inkoop': [
    { naam: 'Grondstoffen', icoon: '🏭' },
    { naam: 'Handelsgoederen', icoon: '📦' },
    { naam: 'Verpakkingsmateriaal', icoon: '📫' },
  ],
  'Overige kosten': [
    { naam: 'Representatiekosten', icoon: '🍽️' },
    { naam: 'Contributies & Lidmaatschappen', icoon: '🎫' },
    { naam: 'Donaties', icoon: '🤲' },
    { naam: 'Overig', icoon: '📎' },
  ],
};

export function gebruikGebruiker() {
  return useAuth();
}

export function gebruikPakket() {
  const { pakket } = useAuth();
  return pakket;
}

export function gebruikCategorieën() {
  const { gebruiker } = gebruikGebruiker();
  const [categorieën, setCategorieën] = useState<Categorie[]>([]);
  const [laden, setLaden] = useState(true);
  const geïnitialiseerd = useRef(false);

  useEffect(() => {
    if (!gebruiker) return;
    const afmelden = onSnapshot(
      collection(db, 'gebruikers', gebruiker.uid, 'categorieën'),
      async (snap) => {
        if (snap.empty && !geïnitialiseerd.current) {
          geïnitialiseerd.current = true;
          try {
            await standaardCategorieënAanmaken();
          } finally {
            setLaden(false);
          }
        } else {
          const gegevens = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Categorie[];
          setCategorieën(gegevens);
          setLaden(false);
        }
      }
    );
    return afmelden;
  }, [gebruiker]);

  async function standaardCategorieënAanmaken() {
    if (!gebruiker) return;
    const batch = writeBatch(db);
    const hoofdIds: Record<string, string> = {};

    for (const cat of STANDAARD_CATEGORIEEN) {
      const ref = doc(collection(db, 'gebruikers', gebruiker.uid, 'categorieën'));
      batch.set(ref, { ...cat, aangemaaktOp: new Date().toISOString() });
      hoofdIds[cat.naam] = ref.id;
    }

    for (const [hoofdNaam, subs] of Object.entries(STANDAARD_SUBCATEGORIEEN)) {
      const hoofdId = hoofdIds[hoofdNaam];
      if (!hoofdId) continue;
      subs.forEach((sub, index) => {
        const ref = doc(collection(db, 'gebruikers', gebruiker.uid, 'categorieën'));
        batch.set(ref, {
          naam: sub.naam,
          soort: 'uitgave',
          icoon: sub.icoon,
          kleur: '#FF6B00',
          bovenliggend: hoofdId,
          volgorde: index + 1,
          aangemaaktOp: new Date().toISOString(),
        });
      });
    }

    await batch.commit();
  }

  async function toevoegen(categorie: Omit<Categorie, 'id' | 'aangemaaktOp'>) {
    if (!gebruiker) return;
    await addDoc(collection(db, 'gebruikers', gebruiker.uid, 'categorieën'), {
      ...categorie,
      aangemaaktOp: new Date().toISOString(),
    });
  }

  async function bijwerken(id: string, gegevens: Partial<Categorie>) {
    if (!gebruiker) return;
    await updateDoc(doc(db, 'gebruikers', gebruiker.uid, 'categorieën', id), gegevens);
  }

  async function verwijderen(id: string) {
    if (!gebruiker) return;
    const kinderen = categorieën.filter(c => c.bovenliggend === id);
    const batch = writeBatch(db);
    kinderen.forEach(k => batch.delete(doc(db, 'gebruikers', gebruiker.uid, 'categorieën', k.id)));
    batch.delete(doc(db, 'gebruikers', gebruiker.uid, 'categorieën', id));
    await batch.commit();
  }

  const hoofdCategorieën = categorieën
    .filter(c => !c.bovenliggend)
    .sort((a, b) => (a.volgorde ?? 0) - (b.volgorde ?? 0));

  function subCategorieën(hoofdId: string) {
    return categorieën
      .filter(c => c.bovenliggend === hoofdId)
      .sort((a, b) => (a.volgorde ?? 0) - (b.volgorde ?? 0));
  }

  function alleNamen(soort: 'inkomst' | 'uitgave'): string[] {
    return categorieën
      .filter(c => c.soort === soort)
      .map(c => c.naam);
  }

  return { categorieën, hoofdCategorieën, subCategorieën, alleNamen, laden, toevoegen, bijwerken, verwijderen };
}

export function gebruikTransacties() {
  const { gebruiker } = gebruikGebruiker();
  const [transacties, setTransacties] = useState<Transactie[]>([]);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    if (!gebruiker) return;
    const afmelden = onSnapshot(
      collection(db, 'gebruikers', gebruiker.uid, 'transacties'),
      (snap) => {
        const gegevens = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Transactie[];
        setTransacties(gegevens);
        setLaden(false);
      },
      (_err) => { setTransacties([]); setLaden(false); }
    );
    return afmelden;
  }, [gebruiker]);

  async function toevoegen(transactie: Omit<Transactie, 'id' | 'aangemaaktOp'>) {
    if (!gebruiker) return;
    await addDoc(collection(db, 'gebruikers', gebruiker.uid, 'transacties'), {
      ...transactie,
      aangemaaktOp: new Date().toISOString(),
    });
  }

  async function verwijderen(id: string) {
    if (!gebruiker) return;
    await deleteDoc(doc(db, 'gebruikers', gebruiker.uid, 'transacties', id));
  }

  return { transacties, laden, toevoegen, verwijderen };
}

export function gebruikKlanten() {
  const { gebruiker } = gebruikGebruiker();
  const [klanten, setKlanten] = useState<Klant[]>([]);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    if (!gebruiker) return;
    const afmelden = onSnapshot(
      collection(db, 'gebruikers', gebruiker.uid, 'klanten'),
      (snap) => {
        const gegevens = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Klant[];
        setKlanten(gegevens);
        setLaden(false);
      },
      (_err) => { setKlanten([]); setLaden(false); }
    );
    return afmelden;
  }, [gebruiker]);

  async function toevoegen(klant: Omit<Klant, 'id'>) {
    if (!gebruiker) return;
    await addDoc(collection(db, 'gebruikers', gebruiker.uid, 'klanten'), {
      ...klant,
      aangemaaktOp: new Date().toISOString(),
    });
  }

  async function bijwerken(id: string, klant: Partial<Klant>) {
    if (!gebruiker) return;
    await updateDoc(doc(db, 'gebruikers', gebruiker.uid, 'klanten', id), klant);
  }

  async function verwijderen(id: string) {
    if (!gebruiker) return;
    await deleteDoc(doc(db, 'gebruikers', gebruiker.uid, 'klanten', id));
  }

  return { klanten, laden, toevoegen, bijwerken, verwijderen };
}

export function gebruikProducten() {
  const { gebruiker } = gebruikGebruiker();
  const [producten, setProducten] = useState<Product[]>([]);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    if (!gebruiker) return;
    const afmelden = onSnapshot(
      collection(db, 'gebruikers', gebruiker.uid, 'producten'),
      (snap) => {
        const gegevens = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Product[];
        setProducten(gegevens);
        setLaden(false);
      },
      (_err) => { setProducten([]); setLaden(false); }
    );
    return afmelden;
  }, [gebruiker]);

  async function toevoegen(product: Omit<Product, 'id' | 'aangemaaktOp'>) {
    if (!gebruiker) return;
    await addDoc(collection(db, 'gebruikers', gebruiker.uid, 'producten'), {
      ...product,
      aangemaaktOp: new Date().toISOString(),
    });
  }

  async function bijwerken(id: string, product: Partial<Product>) {
    if (!gebruiker) return;
    await updateDoc(doc(db, 'gebruikers', gebruiker.uid, 'producten', id), product);
  }

  async function verwijderen(id: string) {
    if (!gebruiker) return;
    await deleteDoc(doc(db, 'gebruikers', gebruiker.uid, 'producten', id));
  }

  return { producten, laden, toevoegen, bijwerken, verwijderen };
}

export function gebruikFacturen() {
  const { gebruiker } = gebruikGebruiker();
  const [facturen, setFacturen] = useState<Factuur[]>([]);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    if (!gebruiker) return;
    const afmelden = onSnapshot(
      collection(db, 'gebruikers', gebruiker.uid, 'facturen'),
      (snap) => {
        const gegevens = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Factuur[];
        setFacturen(gegevens);
        setLaden(false);
      },
      (_err) => { setFacturen([]); setLaden(false); }
    );
    return afmelden;
  }, [gebruiker]);

  async function toevoegen(factuur: Omit<Factuur, 'id' | 'aangemaaktOp'>) {
    if (!gebruiker) return;
    await addDoc(collection(db, 'gebruikers', gebruiker.uid, 'facturen'), {
      ...factuur,
      aangemaaktOp: new Date().toISOString(),
    });
  }

  async function bijwerken(id: string, gegevens: Partial<Factuur>) {
    if (!gebruiker) return;
    await updateDoc(doc(db, 'gebruikers', gebruiker.uid, 'facturen', id), gegevens);
  }

  async function verwijderen(id: string) {
    if (!gebruiker) return;
    await deleteDoc(doc(db, 'gebruikers', gebruiker.uid, 'facturen', id));
  }

  return { facturen, laden, toevoegen, bijwerken, verwijderen };
}

export function gebruikOffertes() {
  const { gebruiker } = gebruikGebruiker();
  const [offertes, setOffertes] = useState<Offerte[]>([]);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    if (!gebruiker) return;
    const afmelden = onSnapshot(
      collection(db, 'gebruikers', gebruiker.uid, 'offertes'),
      (snap) => {
        const gegevens = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Offerte[];
        setOffertes(gegevens);
        setLaden(false);
      },
      (_err) => { setOffertes([]); setLaden(false); }
    );
    return afmelden;
  }, [gebruiker]);

  async function toevoegen(offerte: Omit<Offerte, 'id' | 'aangemaaktOp'>) {
    if (!gebruiker) return;
    await addDoc(collection(db, 'gebruikers', gebruiker.uid, 'offertes'), {
      ...offerte,
      aangemaaktOp: new Date().toISOString(),
    });
  }

  async function bijwerken(id: string, gegevens: Partial<Offerte>) {
    if (!gebruiker) return;
    await updateDoc(doc(db, 'gebruikers', gebruiker.uid, 'offertes', id), gegevens);
  }

  async function verwijderen(id: string) {
    if (!gebruiker) return;
    await deleteDoc(doc(db, 'gebruikers', gebruiker.uid, 'offertes', id));
  }

  return { offertes, laden, toevoegen, bijwerken, verwijderen };
}

export function gebruikUren() {
  const { gebruiker } = gebruikGebruiker();
  const [uren, setUren] = useState<UrenRegistratie[]>([]);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    if (!gebruiker) return;
    const afmelden = onSnapshot(
      collection(db, 'gebruikers', gebruiker.uid, 'uren'),
      (snap) => {
        const gegevens = snap.docs.map(d => ({ id: d.id, ...d.data() })) as UrenRegistratie[];
        setUren(gegevens);
        setLaden(false);
      },
      (_err) => {
        setUren([]);
        setLaden(false);
      }
    );
    return afmelden;
  }, [gebruiker]);

  async function toevoegen(registratie: Omit<UrenRegistratie, 'id' | 'aangemaaktOp'>) {
    if (!gebruiker) return;
    await addDoc(collection(db, 'gebruikers', gebruiker.uid, 'uren'), {
      ...registratie,
      aangemaaktOp: new Date().toISOString(),
    });
  }

  async function bijwerken(id: string, gegevens: Partial<UrenRegistratie>) {
    if (!gebruiker) return;
    await updateDoc(doc(db, 'gebruikers', gebruiker.uid, 'uren', id), gegevens);
  }

  async function verwijderen(id: string) {
    if (!gebruiker) return;
    await deleteDoc(doc(db, 'gebruikers', gebruiker.uid, 'uren', id));
  }

  return { uren, laden, toevoegen, bijwerken, verwijderen };
}

export function gebruikBedrijf() {
  const { gebruiker } = gebruikGebruiker();
  const [bedrijf, setBedrijf] = useState<Bedrijf>({});
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    if (!gebruiker) return;
    const afmelden = onSnapshot(
      doc(db, 'gebruikers', gebruiker.uid, 'instellingen', 'bedrijf'),
      (snap) => {
        if (snap.exists()) setBedrijf(snap.data() as Bedrijf);
        setLaden(false);
      },
      (_err) => { setLaden(false); }
    );
    return afmelden;
  }, [gebruiker]);

  async function opslaan(gegevens: Bedrijf) {
    if (!gebruiker) return;
    await setDoc(doc(db, 'gebruikers', gebruiker.uid, 'instellingen', 'bedrijf'), gegevens);
  }

  return { bedrijf, laden, opslaan };
}