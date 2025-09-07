import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { attendance, registrations, events, users } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const present = searchParams.get('present');
    const registrationStatus = searchParams.get('registration_status');

    if (!eventId || isNaN(parseInt(eventId))) {
      return NextResponse.json({ 
        error: "Valid event ID is required",
        code: "INVALID_EVENT_ID" 
      }, { status: 400 });
    }

    // Check if user is the event organizer
    const event = await db.select()
      .from(events)
      .where(eq(events.id, parseInt(eventId)))
      .limit(1);

    if (event.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event[0].organizerId !== user.id) {
      return NextResponse.json({ 
        error: 'Only event organizer can access attendance records' 
      }, { status: 403 });
    }

    // Build query with joins
    let query = db.select({
      registrationId: registrations.id,
      registrationDate: registrations.registrationDate,
      registrationStatus: registrations.status,
      userId: users.id,
      userName: users.name,
      userEmail: users.email,
      attendanceId: attendance.id,
      isPresent: attendance.isPresent,
      markedAt: attendance.markedAt,
      markedBy: attendance.markedBy,
      notes: attendance.notes
    })
    .from(registrations)
    .leftJoin(attendance, eq(registrations.id, attendance.registrationId))
    .leftJoin(users, eq(registrations.userId, users.id))
    .where(eq(registrations.eventId, parseInt(eventId)));

    // Apply filters
    if (present !== null) {
      const isPresentValue = present === 'true';
      if (isPresentValue) {
        query = query.where(and(
          eq(registrations.eventId, parseInt(eventId)),
          eq(attendance.isPresent, true)
        ));
      } else {
        query = query.where(and(
          eq(registrations.eventId, parseInt(eventId)),
          or(eq(attendance.isPresent, false), isNull(attendance.isPresent))
        ));
      }
    }

    if (registrationStatus) {
      query = query.where(and(
        eq(registrations.eventId, parseInt(eventId)),
        eq(registrations.status, registrationStatus)
      ));
    }

    const results = await query.limit(limit).offset(offset);

    // Transform results to include default values for missing attendance records
    const transformedResults = results.map(result => ({
      registrationId: result.registrationId,
      registrationDate: result.registrationDate,
      registrationStatus: result.registrationStatus,
      user: {
        id: result.userId,
        name: result.userName,
        email: result.userEmail
      },
      attendance: {
        id: result.attendanceId,
        isPresent: result.isPresent || false,
        markedAt: result.markedAt,
        markedBy: result.markedBy,
        notes: result.notes
      }
    }));

    return NextResponse.json(transformedResults);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const registrationId = searchParams.get('registrationId');

    if (!registrationId || isNaN(parseInt(registrationId))) {
      return NextResponse.json({ 
        error: "Valid registration ID is required",
        code: "INVALID_REGISTRATION_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();

    // Security check: reject if user identifiers provided in body
    if ('userId' in requestBody || 'user_id' in requestBody || 'markedBy' in requestBody || 'marked_by' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { isPresent, notes } = requestBody;

    // Validate required fields
    if (typeof isPresent !== 'boolean') {
      return NextResponse.json({ 
        error: "isPresent must be a boolean value",
        code: "INVALID_IS_PRESENT" 
      }, { status: 400 });
    }

    // Check if registration exists and get event info
    const registration = await db.select({
      id: registrations.id,
      eventId: registrations.eventId,
      organizerId: events.organizerId
    })
    .from(registrations)
    .leftJoin(events, eq(registrations.eventId, events.id))
    .where(eq(registrations.id, parseInt(registrationId)))
    .limit(1);

    if (registration.length === 0) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    // Check if user is the event organizer
    if (registration[0].organizerId !== user.id) {
      return NextResponse.json({ 
        error: 'Only event organizer can modify attendance records' 
      }, { status: 403 });
    }

    // Check if attendance record exists
    const existingAttendance = await db.select()
      .from(attendance)
      .where(eq(attendance.registrationId, parseInt(registrationId)))
      .limit(1);

    const now = new Date().toISOString();
    const attendanceData = {
      isPresent,
      markedAt: now,
      markedBy: user.id,
      notes: notes || null
    };

    let result;

    if (existingAttendance.length === 0) {
      // Create new attendance record
      result = await db.insert(attendance)
        .values({
          registrationId: parseInt(registrationId),
          ...attendanceData
        })
        .returning();
    } else {
      // Update existing attendance record
      result = await db.update(attendance)
        .set(attendanceData)
        .where(eq(attendance.registrationId, parseInt(registrationId)))
        .returning();
    }

    if (result.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update attendance record' 
      }, { status: 500 });
    }

    return NextResponse.json(result[0]);

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}