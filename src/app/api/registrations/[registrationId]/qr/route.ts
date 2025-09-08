import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { registrations, events } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';

export async function GET(
  request: NextRequest,
  { params }: { params: { registrationId: string } }
) {
  try {
    // Get authenticated user
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    // Extract registrationId from URL parameters
    const { registrationId } = params;

    // Validate registrationId parameter
    if (!registrationId || isNaN(parseInt(registrationId))) {
      return NextResponse.json({ 
        error: 'Valid registration ID is required',
        code: 'INVALID_REGISTRATION_ID' 
      }, { status: 400 });
    }

    const regId = parseInt(registrationId);

    // Check that registration exists and belongs to authenticated user
    const registrationData = await db
      .select({
        id: registrations.id,
        eventId: registrations.eventId,
        userId: registrations.userId,
        registrationDate: registrations.registrationDate,
        status: registrations.status,
        eventTitle: events.title,
      })
      .from(registrations)
      .innerJoin(events, eq(registrations.eventId, events.id))
      .where(and(
        eq(registrations.id, regId),
        eq(registrations.userId, user.id)
      ))
      .limit(1);

    // Check if registration exists
    if (registrationData.length === 0) {
      return NextResponse.json({ 
        error: 'Registration not found' 
      }, { status: 404 });
    }

    const registration = registrationData[0];

    // Verify registration belongs to authenticated user (additional security check)
    if (registration.userId !== user.id) {
      return NextResponse.json({ 
        error: 'Access denied: Registration does not belong to you',
        code: 'REGISTRATION_ACCESS_DENIED' 
      }, { status: 403 });
    }

    // Generate timestamps
    const currentTimestamp = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours from now

    // Prepare QR code data
    const qrData = {
      registrationId: registration.id,
      eventId: registration.eventId,
      userId: registration.userId,
      timestamp: currentTimestamp,
      expiresAt: expiresAt,
    };

    // Get JWT secret with fallback
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';

    // Sign QR data with JWT
    const signedData = jwt.sign(qrData, jwtSecret, { 
      expiresIn: '24h',
      algorithm: 'HS256' 
    });

    // Generate QR code as base64 image
    const qrCodeDataURL = await QRCode.toDataURL(signedData, {
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      width: 256,
    });

    // Extract base64 data (remove data:image/png;base64, prefix)
    const base64Data = qrCodeDataURL.split(',')[1];

    // Return success response
    return NextResponse.json({
      qrCode: base64Data,
      registrationId: registration.id,
      eventId: registration.eventId,
      eventTitle: registration.eventTitle,
      registrationDate: registration.registrationDate,
      expiresAt: expiresAt,
    }, { status: 200 });

  } catch (error) {
    console.error('GET QR code generation error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}