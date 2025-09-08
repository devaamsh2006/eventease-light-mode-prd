import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { events, registrations, users, attendance } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { eventId } = params;
    const { searchParams } = new URL(request.url);

    // Validate eventId
    if (!eventId || isNaN(parseInt(eventId))) {
      return NextResponse.json({ 
        error: "Valid event ID is required",
        code: "INVALID_EVENT_ID" 
      }, { status: 400 });
    }

    const eventIdInt = parseInt(eventId);

    // Check if event exists and user is organizer
    const event = await db.select({
      id: events.id,
      title: events.title,
      eventDate: events.eventDate,
      location: events.location,
      organizerId: events.organizerId
    })
    .from(events)
    .where(eq(events.id, eventIdInt))
    .limit(1);

    if (event.length === 0) {
      return NextResponse.json({ 
        error: 'Event not found',
        code: "EVENT_NOT_FOUND" 
      }, { status: 404 });
    }

    // Verify current user is the event organizer
    if (event[0].organizerId !== user.id) {
      return NextResponse.json({ 
        error: 'Access denied. You are not the organizer of this event',
        code: "UNAUTHORIZED_ORGANIZER" 
      }, { status: 403 });
    }

    // Pagination
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get total count of registrations
    const totalCountResult = await db.select({
      count: registrations.id
    })
    .from(registrations)
    .where(eq(registrations.eventId, eventIdInt));

    // Query registrations with user data and attendance using LEFT JOINs
    const attendeesData = await db.select({
      registrationId: registrations.id,
      registrationDate: registrations.registrationDate,
      registrationStatus: registrations.status,
      userId: users.id,
      userName: users.name,
      userEmail: users.email,
      attendanceIsPresent: attendance.isPresent,
      attendanceMarkedAt: attendance.markedAt
    })
    .from(registrations)
    .leftJoin(users, eq(registrations.userId, users.id))
    .leftJoin(attendance, eq(attendance.registrationId, registrations.id))
    .where(eq(registrations.eventId, eventIdInt))
    .orderBy(desc(registrations.createdAt))
    .limit(limit)
    .offset(offset);

    // Transform data to match required response format
    const attendees = attendeesData.map(row => ({
      registrationId: row.registrationId,
      registrationDate: row.registrationDate,
      registrationStatus: row.registrationStatus,
      user: {
        id: row.userId,
        name: row.userName,
        email: row.userEmail
      },
      attendance: {
        isPresent: row.attendanceIsPresent,
        markedAt: row.attendanceMarkedAt,
        status: row.attendanceIsPresent === null 
          ? 'not_marked' 
          : (row.attendanceIsPresent ? 'present' : 'absent')
      }
    }));

    return NextResponse.json({
      event: {
        id: event[0].id,
        title: event[0].title,
        eventDate: event[0].eventDate,
        location: event[0].location
      },
      attendees,
      totalCount: totalCountResult.length
    });

  } catch (error) {
    console.error('GET attendee list error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}