import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { events, registrations, attendance, users } from '@/db/schema';
import { eq, and, or, like, desc, isNull, isNotNull, count } from 'drizzle-orm';
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

    // Check if event exists and verify organizer
    const eventRecord = await db.select({
      id: events.id,
      title: events.title,
      eventDate: events.eventDate,
      location: events.location,
      organizerId: events.organizerId
    })
    .from(events)
    .where(eq(events.id, eventIdInt))
    .limit(1);

    if (eventRecord.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const event = eventRecord[0];

    // Verify current user is the event organizer
    if (event.organizerId !== user.id) {
      return NextResponse.json({ 
        error: 'You are not authorized to view attendees for this event',
        code: "NOT_EVENT_ORGANIZER" 
      }, { status: 403 });
    }

    // Get pagination parameters
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get filter parameters
    const statusFilter = searchParams.get('status');
    const attendanceFilter = searchParams.get('attendance');
    const search = searchParams.get('search');

    // Build base query conditions
    let whereConditions = [eq(registrations.eventId, eventIdInt)];

    // Add status filter
    if (statusFilter && (statusFilter === 'registered' || statusFilter === 'cancelled')) {
      whereConditions.push(eq(registrations.status, statusFilter));
    }

    // Add search filter
    if (search) {
      const searchCondition = or(
        like(users.name, `%${search}%`),
        like(users.email, `%${search}%`)
      );
      whereConditions.push(searchCondition);
    }

    // Build attendance filter condition
    let attendanceCondition = null;
    if (attendanceFilter) {
      switch (attendanceFilter) {
        case 'present':
          attendanceCondition = eq(attendance.isPresent, true);
          break;
        case 'absent':
          attendanceCondition = eq(attendance.isPresent, false);
          break;
        case 'not_marked':
          attendanceCondition = isNull(attendance.id);
          break;
      }
    }

    // Get total registrations count for the event
    const totalRegistrationsResult = await db.select({ count: count() })
      .from(registrations)
      .where(eq(registrations.eventId, eventIdInt));
    
    const totalRegistrations = totalRegistrationsResult[0]?.count || 0;

    // Get counts for attendance status
    const [presentCountResult, absentCountResult, notMarkedCountResult] = await Promise.all([
      // Present count
      db.select({ count: count() })
        .from(registrations)
        .leftJoin(attendance, eq(registrations.id, attendance.registrationId))
        .where(and(
          eq(registrations.eventId, eventIdInt),
          eq(attendance.isPresent, true)
        )),
      
      // Absent count
      db.select({ count: count() })
        .from(registrations)
        .leftJoin(attendance, eq(registrations.id, attendance.registrationId))
        .where(and(
          eq(registrations.eventId, eventIdInt),
          eq(attendance.isPresent, false)
        )),
      
      // Not marked count
      db.select({ count: count() })
        .from(registrations)
        .leftJoin(attendance, eq(registrations.id, attendance.registrationId))
        .where(and(
          eq(registrations.eventId, eventIdInt),
          isNull(attendance.id)
        ))
    ]);

    const presentCount = presentCountResult[0]?.count || 0;
    const absentCount = absentCountResult[0]?.count || 0;
    const notMarkedCount = notMarkedCountResult[0]?.count || 0;

    // Build main query for attendees
    let attendeesQuery = db.select({
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
      notes: attendance.notes,
      markedByName: users.name
    })
    .from(registrations)
    .innerJoin(users, eq(registrations.userId, users.id))
    .leftJoin(attendance, eq(registrations.id, attendance.registrationId))
    .leftJoin(users, eq(attendance.markedBy, users.id))
    .where(and(...whereConditions));

    // Add attendance filter if specified
    if (attendanceCondition) {
      attendeesQuery = attendeesQuery.where(and(...whereConditions, attendanceCondition));
    }

    // Apply ordering and pagination
    const attendeesResult = await attendeesQuery
      .orderBy(desc(registrations.registrationDate))
      .limit(limit)
      .offset(offset);

    // Get total count for filtered results
    let totalCountQuery = db.select({ count: count() })
      .from(registrations)
      .innerJoin(users, eq(registrations.userId, users.id))
      .leftJoin(attendance, eq(registrations.id, attendance.registrationId))
      .where(and(...whereConditions));

    if (attendanceCondition) {
      totalCountQuery = totalCountQuery.where(and(...whereConditions, attendanceCondition));
    }

    const totalCountResult = await totalCountQuery;
    const totalCount = totalCountResult[0]?.count || 0;

    // Format the response
    const attendees = attendeesResult.map(row => ({
      registrationId: row.registrationId,
      registrationDate: row.registrationDate,
      registrationStatus: row.registrationStatus,
      user: {
        id: row.userId,
        name: row.userName,
        email: row.userEmail
      },
      attendance: {
        id: row.attendanceId,
        isPresent: row.isPresent,
        markedAt: row.markedAt,
        markedBy: row.markedBy,
        markedByName: row.markedByName,
        notes: row.notes,
        status: row.attendanceId === null 
          ? 'not_marked' 
          : row.isPresent 
            ? 'present' 
            : 'absent'
      },
      qrGenerated: false
    }));

    return NextResponse.json({
      event: {
        id: event.id,
        title: event.title,
        eventDate: event.eventDate,
        location: event.location,
        totalRegistrations
      },
      attendees,
      totalCount,
      presentCount,
      absentCount,
      notMarkedCount
    });

  } catch (error) {
    console.error('GET attendee list error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}