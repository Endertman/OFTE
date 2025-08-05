// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import type { Workshop, Inscription } from './types/workshop';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCgXe4yo_R-KvNblWygDFn3TQ5CIxyyexc",
  authDomain: "ofte-landing-unab.firebaseapp.com",
  projectId: "ofte-landing-unab",
  storageBucket: "ofte-landing-unab.firebasestorage.app",
  messagingSenderId: "76733059112",
  appId: "1:76733059112:web:2e9343a1229d124503a51d",
  measurementId: "G-XVTG14TKMD"
};

// Initialize Firebase
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);

// Inicializar Analytics solo en el cliente
if (typeof window !== 'undefined') {
  isSupported().then(yes => {
    if (yes) {
      getAnalytics(app);
    }
  });
}

// Función para obtener todos los workshops
export async function getWorkshops(): Promise<Workshop[]> {
  try {
    const workshopsCollection = collection(db, "workshops");
    const workshopsSnapshot = await getDocs(workshopsCollection);
    return workshopsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        date: data.date || '',
        location: data.location || '',
        image: data.image || '',
        description: data.description || '',
        features: Array.isArray(data.features) ? data.features : []
      } as Workshop;
    });
  } catch (error) {
    console.error("Error al obtener workshops:", error);
    return [];
  }
}

// Función para obtener los próximos 3 workshops
export async function getNextWorkshops(limit = 3): Promise<Workshop[]> {
  try {
    const workshops = await getWorkshops();
    const now = new Date();

    const future = workshops
      .filter(w => new Date(w.date) >= now)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const past = workshops
      .filter(w => new Date(w.date) < now)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const result = [...future, ...past].slice(0, limit);

    return result;
  } catch (error) {
    console.error("Error al obtener próximos workshops:", error);
    return [];
  }
}

// Función para obtener todas las inscripciones
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
        phone: data.phone || '',
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