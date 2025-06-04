import type { APIRoute } from 'astro';
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";
import { app } from '../../../firebase';

export const prerender = false;

const db = getFirestore(app);

export const GET: APIRoute = async () => {
  try {
    const inscriptionsCollection = collection(db, "inscriptions");
    const inscriptionsSnapshot = await getDocs(inscriptionsCollection);
    const inscriptions = inscriptionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return new Response(JSON.stringify(inscriptions), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error al obtener inscripciones:', error);
    return new Response(JSON.stringify({
      error: 'Error al obtener inscripciones'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    
    // Validar datos requeridos
    const requiredFields = ['name', 'email', 'phone', 'institution', 'workshopId', 'workshopName'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return new Response(JSON.stringify({
          error: `El campo ${field} es requerido`
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
    }

    // Agregar timestamp
    const inscriptionData = {
      ...data,
      createdAt: new Date().toISOString(),
      status: 'pending' // pending, approved, rejected
    };

    // Guardar en Firestore
    const docRef = await addDoc(collection(db, 'inscriptions'), inscriptionData);

    return new Response(JSON.stringify({
      success: true,
      id: docRef.id
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error al guardar la inscripción:', error);
    return new Response(JSON.stringify({
      error: 'Error al procesar la inscripción'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 