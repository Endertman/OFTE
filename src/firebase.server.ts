import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { Workshop } from './types/workshop';

const rawKey = import.meta.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!rawKey) {
  throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_KEY");
}

const serviceAccount = JSON.parse(rawKey);

export const adminApp = getApps().length === 0
  ? initializeApp({ credential: cert(serviceAccount) })
  : getApps()[0];

export const adminDb = getFirestore(adminApp);

export async function getWorkshops(): Promise<Workshop[]> {
  const snapshot = await adminDb.collection('workshops').get();
  return snapshot.docs
    .map((doc) => {
      const data = doc.data();
      if (!data) return null;
      return {
        id: doc.id,
        name: data.name ?? '',
        date: data.date ?? '',
        location: data.location ?? '',
        image: data.image ?? '',
        description: data.description ?? '',
        short_description: data.short_description ?? '',
        features: Array.isArray(data.features) ? data.features : [],
      } as Workshop;
    })
    .filter(Boolean) as Workshop[];
}