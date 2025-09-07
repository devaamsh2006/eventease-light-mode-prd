import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    return await auth.handler(request);
  } catch (error) {
    console.error('GET auth error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Authentication service error',
        code: 'AUTH_SERVICE_ERROR' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    return await auth.handler(request);
  } catch (error) {
    console.error('POST auth error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Authentication service error',
        code: 'AUTH_SERVICE_ERROR' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}