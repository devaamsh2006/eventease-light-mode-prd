import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { events, registrations, users } from '@/db/schema';
import { eq, and, count } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const requestBody = await request.json();
    const { eventId } = requestBody;

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Validate eventId is provided
    if (!eventId) {
      return NextResponse.json({ 
        error: "Event ID is required",
        code: "MISSING_EVENT_ID" 
      }, { status: 400 });
    }

    // Validate eventId is valid integer
    if (isNaN(parseInt(eventId))) {
      return NextResponse.json({ 
        error: "Valid event ID is required",
        code: "INVALID_EVENT_ID" 
      }, { status: 400 });
    }

    // Check if event exists and is published
    const event = await db.select()
      .from(events)
      .where(and(eq(events.id, parseInt(eventId)), eq(events.status, 'published')))
      .limit(1);

    if (event.length === 0) {
      return NextResponse.json({ 
        error: 'Event not found or not published',
        code: 'EVENT_NOT_FOUND' 
      }, { status: 404 });
    }

    // Check if event date hasn't passed
    const eventDate = new Date(event[0].eventDate);
    const currentDate = new Date();
    if (eventDate <= currentDate) {
      return NextResponse.json({ 
        error: 'Cannot register for past events',
        code: 'EVENT_PAST' 
      }, { status: 400 });
    }

    // Check if user is already registered for this event
    const existingRegistration = await db.select()
      .from(registrations)
      .where(and(
        eq(registrations.eventId, parseInt(eventId)),
        eq(registrations.userId, user.id),
        eq(registrations.status, 'registered')
      ))
      .limit(1);

    if (existingRegistration.length > 0) {
      return NextResponse.json({ 
        error: 'Already registered for this event',
        code: 'ALREADY_REGISTERED' 
      }, { status: 400 });
    }

    // Check event capacity if maxAttendees is set
    if (event[0].maxAttendees) {
      const currentRegistrations = await db.select({ count: count() })
        .from(registrations)
        .where(and(
          eq(registrations.eventId, parseInt(eventId)),
          eq(registrations.status, 'registered')
        ));

      if (currentRegistrations[0].count >= event[0].maxAttendees) {
        return NextResponse.json({ 
          error: 'Event is at full capacity',
          code: 'EVENT_FULL' 
        }, { status: 400 });
      }
    }

    // Create registration record
    const newRegistration = await db.insert(registrations)
      .values({
        eventId: parseInt(eventId),
        userId: user.id,
        registrationDate: new Date().toISOString(),
        status: 'registered',
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newRegistration[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    // Validate eventId is provided
    if (!eventId) {
      return NextResponse.json({ 
        error: "Event ID is required",
        code: "MISSING_EVENT_ID" 
      }, { status: 400 });
    }

    // Validate eventId is valid integer
    if (isNaN(parseInt(eventId))) {
      return NextResponse.json({ 
        error: "Valid event ID is required",
        code: "INVALID_EVENT_ID" 
      }, { status: 400 });
    }

    // Check if event exists
    const event = await db.select()
      .from(events)
      .where(eq(events.id, parseInt(eventId)))
      .limit(1);

    if (event.length === 0) {
      return NextResponse.json({ 
        error: 'Event not found',
        code: 'EVENT_NOT_FOUND' 
      }, { status: 404 });
    }

    // Check if event hasn't started (allow cancellation only before event starts)
    const eventDate = new Date(event[0].eventDate);
    const currentDate = new Date();
    if (eventDate <= currentDate) {
      return NextResponse.json({ 
        error: 'Cannot cancel registration for events that have already started',
        code: 'EVENT_STARTED' 
      }, { status: 400 });
    }

    // Check if user has active registration for this event
    const activeRegistration = await db.select()
      .from(registrations)
      .where(and(
        eq(registrations.eventId, parseInt(eventId)),
        eq(registrations.userId, user.id),
        eq(registrations.status, 'registered')
      ))
      .limit(1);

    if (activeRegistration.length === 0) {
      return NextResponse.json({ 
        error: 'No active registration found for this event',
        code: 'NO_REGISTRATION_FOUND' 
      }, { status: 404 });
    }

    // Update registration status to cancelled (don't delete for audit trail)
    const cancelledRegistration = await db.update(registrations)
      .set({
        status: 'cancelled'
      })
      .where(and(
        eq(registrations.eventId, parseInt(eventId)),
        eq(registrations.userId, user.id),
        eq(registrations.status, 'registered')
      ))
      .returning();

    return NextResponse.json({
      message: 'Registration cancelled successfully',
      registration: cancelledRegistration[0]
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}