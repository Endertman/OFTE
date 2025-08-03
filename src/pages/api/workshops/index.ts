import type { APIRoute } from 'astro';
import { adminDb } from '../../../firebase.server';

// Usar adminDb directamente

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
    const docRef = await adminDb.collection('workshops').add(data);

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
    const workshopsSnapshot = await adminDb.collection('workshops').get();
    const workshops = workshopsSnapshot.docs.map((doc: FirebaseFirestore.DocumentSnapshot) => ({
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