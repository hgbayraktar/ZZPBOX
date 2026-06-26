import { collection, getDocs, doc, getDoc, runTransaction, setDoc } from 'firebase/firestore';
import { db } from '../constants/firebase';

export async function nieuwFactuurNummer(uid: string, isCredit: boolean): Promise<string> {
  const jaar = new Date().getFullYear();
  const tellerRef = doc(db, 'gebruikers', uid, 'tellers', 'facturen');

  // First time: initialize counter from existing invoices to avoid collisions
  const tellerSnap = await getDoc(tellerRef);
  if (!tellerSnap.exists() || tellerSnap.data().jaar !== jaar) {
    const facturenSnap = await getDocs(collection(db, 'gebruikers', uid, 'facturen'));
    let maxBestaand = 0;
    facturenSnap.forEach(d => {
      const nummerStr = d.data().factuurNummer || d.data().nummer || '';
      const datumStr = d.data().datum || '';
      if (!datumStr.startsWith(String(jaar))) return;
      const match = nummerStr.match(/(\d+)$/);
      if (match) maxBestaand = Math.max(maxBestaand, parseInt(match[1]));
    });
    await setDoc(tellerRef, { jaar, laatsteNummer: maxBestaand });
  }

  const volgend = await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(tellerRef);
    let laatste = 0;
    if (snap.exists()) {
      const data = snap.data();
      laatste = data.jaar === jaar ? (data.laatsteNummer ?? 0) : 0;
    }
    const volgende = laatste + 1;
    transaction.set(tellerRef, { jaar, laatsteNummer: volgende });
    return volgende;
  });

  const volgnummer = String(volgend).padStart(3, '0');
  return isCredit ? `CN-${jaar}-${volgnummer}` : `${jaar}-${volgnummer}`;
}
