
import { redirect } from 'next/navigation';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest, response: NextResponse) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  return redirect('/clash?token=' + token)
}

export const dynamic = 'force-dynamic'