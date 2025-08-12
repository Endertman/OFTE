import type { APIRoute } from 'astro';
import { adminDb } from '../../firebase.server';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { 'full-name': name, email, message } = data;

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Todos los campos son requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await adminDb.collection('contacts').add({
      name,
      email,
      message,
      createdAt: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error saving contact:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};