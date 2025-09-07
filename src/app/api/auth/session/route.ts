import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get session cookie from request
    const sessionCookie = request.cookies.get('session');
    
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ 
        error: 'No session found',
        code: 'NO_SESSION' 
      }, { status: 401 });
    }

    // Extract user ID from session cookie format "user_{id}"
    const sessionValue = sessionCookie.value;
    if (!sessionValue.startsWith('user_')) {
      return NextResponse.json({ 
        error: 'Invalid session format',
        code: 'INVALID_SESSION_FORMAT' 
      }, { status: 401 });
    }

    const userIdStr = sessionValue.replace('user_', '');
    const userId = parseInt(userIdStr);

    if (isNaN(userId) || userId <= 0) {
      return NextResponse.json({ 
        error: 'Invalid user ID in session',
        code: 'INVALID_USER_ID' 
      }, { status: 401 });
    }

    // Look up user in database by ID
    const user = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND' 
      }, { status: 404 });
    }

    // Return user object without password
    return NextResponse.json(user[0], { status: 200 });

  } catch (error) {
    console.error('GET session error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}