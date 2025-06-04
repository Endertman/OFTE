import type { APIRoute } from 'astro';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
import { app } from '../../../firebase';

const db = getFirestore(app);

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    
    // Validar datos requeridos
    const requiredFields = ['name', 'date', 'location', 'image', 'description', 'features'];
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

    // Guardar en Firestore
    const docRef = await addDoc(collection(db, 'workshops'), data);

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
    console.error('Error al crear el workshop:', error);
    return new Response(JSON.stringify({
      error: 'Error al crear el workshop'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

export const GET: APIRoute = async () => {
  try {
    const workshopsCollection = collection(db, 'workshops');
    const workshopsSnapshot = await getDocs(workshopsCollection);
    const workshops = workshopsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return new Response(JSON.stringify(workshops), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error al obtener workshops:', error);
    return new Response(JSON.stringify({
      error: 'Error al obtener workshops'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 