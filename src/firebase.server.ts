import type { Workshop } from './types/workshop';
// Obtener todos los workshops (para uso en SSR/prerender)
export async function getWorkshops(): Promise<Workshop[]> {
  const snapshot = await adminDb.collection('workshops').get();
  return snapshot.docs
    .map((doc: FirebaseFirestore.DocumentSnapshot) => {
      const data = doc.data();
      if (!data) return null;
      return {
        id: doc.id,
        name: data.name,
        date: data.date,
        location: data.location,
        image: data.image,
        description: data.description,
        features: data.features,
      } as Workshop;
    })
    .filter(Boolean) as Workshop[];
}
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// La clave de servicio debe estar en una variable de entorno como string JSON
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);

export const adminApp = getApps().length === 0
  ? initializeApp({ credential: cert(serviceAccount) })
  : getApps()[0];

export const adminDb = getFirestore(adminApp);