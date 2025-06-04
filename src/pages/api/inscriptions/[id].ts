import type { APIRoute } from 'astro';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { app } from '../../../firebase';

const db = getFirestore(app);

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    const data = await request.json();
    
    if (!id) {
      return new Response(JSON.stringify({
        error: 'ID de inscripción no proporcionado'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    if (!data.status || !['approved', 'rejected', 'pending'].includes(data.status)) {
      return new Response(JSON.stringify({
        error: 'Estado no válido'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    await updateDoc(doc(db, 'inscriptions', id), {
      status: data.status,
      updatedAt: new Date().toISOString()
    });

    return new Response(JSON.stringify({
      success: true
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error al actualizar la inscripción:', error);
    return new Response(JSON.stringify({
      error: 'Error al actualizar la inscripción'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 