import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { attendance, registrations, events, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify user has organizer role
    if (user.role !== 'organizer') {
      return NextResponse.json({ 
        error: 'Organizer role required',
        code: 'INSUFFICIENT_PERMISSIONS' 
      }, { status: 403 });
    }

    const { qrData, notes } = await request.json();

    // Validate required fields
    if (!qrData) {
      return NextResponse.json({ 
        error: 'QR data is required',
        code: 'MISSING_QR_DATA' 
      }, { status: 400 });
    }

    // Verify and decode JWT token
    let decodedToken;
    try {
      decodedToken = jwt.verify(qrData, process.env.JWT_SECRET!) as any;
    } catch (error) {
      return NextResponse.json({ 
        error: 'Invalid QR code data',
        code: 'INVALID_QR_TOKEN' 
      }, { status: 400 });
    }

    const { registrationId, eventId, userId, timestamp } = decodedToken;

    // Validate token hasn't expired (24 hours)
    const tokenTimestamp = new Date(timestamp).getTime();
    const currentTimestamp = new Date().getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (currentTimestamp - tokenTimestamp > twentyFourHours) {
      return NextResponse.json({ 
        error: 'QR code has expired',
        code: 'QR_TOKEN_EXPIRED' 
      }, { status: 400 });
    }

    // Get event details and verify organizer authorization
    const eventRecord = await db.select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (eventRecord.length === 0) {
      return NextResponse.json({ 
        error: 'Event not found',
        code: 'EVENT_NOT_FOUND' 
      }, { status: 404 });
    }

    const event = eventRecord[0];

    // Verify organizer is authorized for this event
    if (event.organizerId !== user.id) {
      return NextResponse.json({ 
        error: 'Not authorized for this event',
        code: 'EVENT_NOT_AUTHORIZED' 
      }, { status: 403 });
    }

    // Check if event date is today or in the past
    const eventDate = new Date(event.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);

    if (eventDate > today) {
      return NextResponse.json({ 
        error: 'Cannot mark attendance for future events',
        code: 'FUTURE_EVENT' 
      }, { status: 400 });
    }

    // Get registration details with user information
    const registrationRecord = await db.select({
      registration: registrations,
      attendee: users
    })
      .from(registrations)
      .innerJoin(users, eq(registrations.userId, users.id))
      .where(eq(registrations.id, registrationId))
      .limit(1);

    if (registrationRecord.length === 0) {
      return NextResponse.json({ 
        error: 'Registration not found',
        code: 'REGISTRATION_NOT_FOUND' 
      }, { status: 404 });
    }

    const { registration, attendee } = registrationRecord[0];

    // Verify registration is in 'registered' status
    if (registration.status !== 'registered') {
      return NextResponse.json({ 
        error: 'Registration is not in registered status',
        code: 'INVALID_REGISTRATION_STATUS' 
      }, { status: 400 });
    }

    // Check if attendance already exists
    const existingAttendance = await db.select()
      .from(attendance)
      .where(eq(attendance.registrationId, registrationId))
      .limit(1);

    const currentTime = new Date().toISOString();

    let attendanceRecord;

    if (existingAttendance.length > 0) {
      // Check if already marked as present
      if (existingAttendance[0].isPresent) {
        return NextResponse.json({ 
          error: 'Attendance already marked as present',
          code: 'ALREADY_PRESENT' 
        }, { status: 400 });
      }

      // Update existing attendance record
      const updated = await db.update(attendance)
        .set({
          isPresent: true,
          markedAt: currentTime,
          markedBy: user.id,
          notes: notes || null
        })
        .where(eq(attendance.registrationId, registrationId))
        .returning();

      attendanceRecord = updated[0];
    } else {
      // Create new attendance record
      const created = await db.insert(attendance)
        .values({
          registrationId,
          isPresent: true,
          markedAt: currentTime,
          markedBy: user.id,
          notes: notes || null
        })
        .returning();

      attendanceRecord = created[0];
    }

    // Get marked by user details
    const markedByUser = await db.select({
      id: users.id,
      name: users.name,
      email: users.email
    })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    return NextResponse.json({
      success: true,
      attendanceId: attendanceRecord.id,
      registrationId: attendanceRecord.registrationId,
      attendeeName: attendee.name,
      eventTitle: event.title,
      markedAt: attendanceRecord.markedAt,
      markedBy: markedByUser[0]
    }, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}