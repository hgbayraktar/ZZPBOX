import { doc, runTransaction } from 'firebase/firestore';
import { db } from '../constants/firebase';

export async function nieuwFactuurNummer(uid: string, isCredit: boolean): Promise<string> {
  const jaar = new Date().getFullYear();
  const tellerRef = doc(db, 'gebruikers', uid, 'tellers', 'facturen');

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
