import { getFirestore, collection, getDocs } from "firebase/firestore";
import type { Inscription } from '../types/workshop';
import { app } from '../firebase';

const db = getFirestore(app);

export async function getInscriptions(): Promise<Inscription[]> {
  try {
    const inscriptionsCollection = collection(db, "inscriptions");
    const inscriptionsSnapshot = await getDocs(inscriptionsCollection);
    return inscriptionsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        email: data.email || '',
        degree: data.degree || '',
        institution: data.institution || '',
        workshopId: data.workshopId || '',
        workshopName: data.workshopName || '',
        status: data.status || 'pending',
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt
      } as Inscription;
    });
  } catch (error) {
    console.error("Error al obtener inscripciones:", error);
    return [];
  }
} 