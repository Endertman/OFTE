import type { APIRoute } from 'astro';
import { getFirestore, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { app } from '../../../firebase';

const db = getFirestore(app);

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    
    if (!id) {
      return new Response(JSON.stringify({
        error: 'ID de workshop no proporcionado'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    await deleteDoc(doc(db, 'workshops', id));

    return new Response(JSON.stringify({
      success: true
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error al eliminar el workshop:', error);
    return new Response(JSON.stringify({
      error: 'Error al eliminar el workshop'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    const data = await request.json();
    
    if (!id) {
      return new Response(JSON.stringify({
        error: 'ID de workshop no proporcionado'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

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

    await updateDoc(doc(db, 'workshops', id), data);

    return new Response(JSON.stringify({
      success: true
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error al actualizar el workshop:', error);
    return new Response(JSON.stringify({
      error: 'Error al actualizar el workshop'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 