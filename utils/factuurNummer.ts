import { collection, getDocs, doc, getDoc, runTransaction, setDoc } from 'firebase/firestore';
import { db } from '../constants/firebase';

// getDocs bootstrap runs OUTSIDE runTransaction to avoid non-transactional reads inside a transaction
async function bootstrapMax(uid: string, collectie: string, jaarFilter: number | null): Promise<number> {
  const snap = await getDocs(collection(db, 'gebruikers', uid, collectie));
  let max = 0;
  snap.forEach(d => {
    if (jaarFilter !== null) {
      const datumStr = d.data().datum || '';
      // Handle both ISO (2026-06-28) and NL (28-6-2026) date formats
      if (!datumStr.includes(String(jaarFilter))) return;
    }
    const nummerStr = d.data().factuurNummer || d.data().offerteNummer || d.data().nummer || '';
    const match = nummerStr.match(/(\d+)$/);
    if (match) max = Math.max(max, parseInt(match[1]));
  });
  return max;
}

export async function nieuwFactuurNummer(uid: string, isCredit: boolean): Promise<string> {
  const tellerRef = doc(db, 'gebruikers', uid, 'tellers', 'facturen');

  const vooraf = await getDoc(tellerRef);
  let bootstrapWaarde = 0;
  if (!vooraf.exists()) {
    bootstrapWaarde = await bootstrapMax(uid, 'facturen', null);
  }

  const volgend = await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(tellerRef);
    let laatste = bootstrapWaarde;
    if (snap.exists()) {
      laatste = Math.max(snap.data().laatsteNummer ?? 0, bootstrapWaarde);
    }
    const volgende = laatste + 1;
    transaction.set(tellerRef, { laatsteNummer: volgende });
    return volgende;
  });

  return isCredit ? `CN-${volgend}` : `${volgend}`;
}

export async function nieuwOfferteNummer(uid: string): Promise<string> {
  const tellerRef = doc(db, 'gebruikers', uid, 'tellers', 'offertes');

  const vooraf = await getDoc(tellerRef);
  let bootstrapWaarde = 0;
  if (!vooraf.exists()) {
    bootstrapWaarde = await bootstrapMax(uid, 'offertes', null);
  }

  const volgend = await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(tellerRef);
    let laatste = bootstrapWaarde;
    if (snap.exists()) {
      laatste = Math.max(snap.data().laatsteNummer ?? 0, bootstrapWaarde);
    }
    const volgende = laatste + 1;
    transaction.set(tellerRef, { laatsteNummer: volgende });
    return volgende;
  });

  return `OFR${String(volgend).padStart(4, '0')}`;
}

export async function setOfferteStartNummer(uid: string, startNummer: number): Promise<void> {
  const tellerRef = doc(db, 'gebruikers', uid, 'tellers', 'offertes');
  await setDoc(tellerRef, { laatsteNummer: startNummer - 1 });
}

export async function setFactuurStartNummer(uid: string, startNummer: number): Promise<void> {
  const tellerRef = doc(db, 'gebruikers', uid, 'tellers', 'facturen');
  await setDoc(tellerRef, { laatsteNummer: startNummer - 1 });
}
