import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Create response with success message
    const response = NextResponse.json({
      message: 'Successfully signed out'
    }, { status: 200 });

    // Clear the session cookie by setting it with expired date
    response.cookies.set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0), // Set to epoch time to expire immediately
      path: '/'
    });

    // Also clear any potential auth-token cookie as fallback
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0),
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Signout error:', error);
    
    // Even if there's an error, we should still try to clear cookies
    const response = NextResponse.json({
      message: 'Signed out successfully'
    }, { status: 200 });

    // Clear cookies even in error case
    response.cookies.set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0),
      path: '/'
    });

    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0),
      path: '/'
    });

    return response;
  }
}