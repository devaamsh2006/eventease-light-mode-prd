import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({
        error: 'Email and password are required',
        code: 'MISSING_REQUIRED_FIELDS'
      }, { status: 400 });
    }

    // Find user by email (case insensitive)
    const userResult = await db.select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      }, { status: 401 });
    }

    const user = userResult[0];

    // Compare provided password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      }, { status: 401 });
    }

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    // Create response with user data
    const response = NextResponse.json({
      user: userWithoutPassword,
      message: 'Login successful'
    }, { status: 200 });

    // Set simple session cookie
    response.cookies.set('session', `user_${user.id}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('POST signin error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}