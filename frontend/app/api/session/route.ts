// app/api/session/route.ts
import { NextResponse } from 'next/server';
import { auth } from '../../../auth'; // Ajusta la ruta según corresponda

export async function GET() {
  const session = await auth(); // Obtén la sesión del usuario
  return NextResponse.json(session);
}
