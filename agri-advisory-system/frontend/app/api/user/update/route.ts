import { NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://ai-based-agricultural-advisory-system-ouyx.onrender.com';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch(`${BACKEND_URL}/user/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('API /user/update proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Unable to communicate with backend service' },
      { status: 500 }
    );
  }
}
