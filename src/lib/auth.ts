import { NextRequest } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getCurrentUser(request: NextRequest) {
  try {
    // Get session cookie from request
    const sessionCookie = request.cookies.get('session');
    
    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }

    // Extract user ID from session cookie format "user_{id}"
    const sessionValue = sessionCookie.value;
    if (!sessionValue.startsWith('user_')) {
      return null;
    }

    const userIdStr = sessionValue.replace('user_', '');
    const userId = parseInt(userIdStr);

    if (isNaN(userId) || userId <= 0) {
      return null;
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
      return null;
    }

    // Return user object without password
    return user[0];

  } catch (error) {
    console.error('getCurrentUser error:', error);
    return null;
  }
}