import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { attendance, registrations, events, users } from '@/db/schema';
import { eq, and, gte, lte, desc, asc, isNotNull } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Filter parameters
    const presentFilter = searchParams.get('present');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    
    // Sorting parameters
    const sort = searchParams.get('sort') || 'eventDate';
    const order = searchParams.get('order') || 'desc';

    // Validate sort field
    const allowedSortFields = ['eventDate', 'markedAt'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'eventDate';
    
    // Validate order
    const sortOrder = order === 'asc' ? asc : desc;

    // Build base query with joins
    let query = db
      .select({
        id: attendance.id,
        isPresent: attendance.isPresent,
        markedAt: attendance.markedAt,
        notes: attendance.notes,
        registrationId: attendance.registrationId,
        registrationDate: registrations.registrationDate,
        registrationStatus: registrations.status,
        eventId: events.id,
        eventTitle: events.title,
        eventDescription: events.description,
        eventDate: events.eventDate,
        eventLocation: events.location,
      })
      .from(attendance)
      .innerJoin(registrations, eq(attendance.registrationId, registrations.id))
      .innerJoin(events, eq(registrations.eventId, events.id))
      .where(
        and(
          eq(registrations.userId, user.id),
          isNotNull(attendance.markedAt) // Only show records where attendance was actually marked
        )
      );

    // Apply filters
    const conditions = [
      eq(registrations.userId, user.id),
      isNotNull(attendance.markedAt)
    ];

    // Present/absent filter
    if (presentFilter !== null) {
      if (presentFilter === 'true') {
        conditions.push(eq(attendance.isPresent, true));
      } else if (presentFilter === 'false') {
        conditions.push(eq(attendance.isPresent, false));
      } else {
        return NextResponse.json({ 
          error: "Present filter must be 'true' or 'false'",
          code: "INVALID_PRESENT_FILTER" 
        }, { status: 400 });
      }
    }

    // Date range filters
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      if (isNaN(fromDate.getTime())) {
        return NextResponse.json({ 
          error: "Invalid date_from format. Use YYYY-MM-DD",
          code: "INVALID_DATE_FROM" 
        }, { status: 400 });
      }
      conditions.push(gte(events.eventDate, dateFrom));
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      if (isNaN(toDate.getTime())) {
        return NextResponse.json({ 
          error: "Invalid date_to format. Use YYYY-MM-DD",
          code: "INVALID_DATE_TO" 
        }, { status: 400 });
      }
      conditions.push(lte(events.eventDate, dateTo));
    }

    // Apply all conditions
    query = query.where(and(...conditions));

    // Apply sorting
    if (sortField === 'eventDate') {
      query = query.orderBy(sortOrder(events.eventDate));
    } else if (sortField === 'markedAt') {
      query = query.orderBy(sortOrder(attendance.markedAt));
    }

    // Apply pagination
    const results = await query.limit(limit).offset(offset);

    // Transform results to match expected format
    const attendanceHistory = results.map(record => ({
      id: record.id,
      isPresent: record.isPresent,
      markedAt: record.markedAt,
      notes: record.notes,
      registration: {
        id: record.registrationId,
        registrationDate: record.registrationDate,
        status: record.registrationStatus,
      },
      event: {
        id: record.eventId,
        title: record.eventTitle,
        description: record.eventDescription,
        eventDate: record.eventDate,
        location: record.eventLocation,
      }
    }));

    return NextResponse.json(attendanceHistory, { status: 200 });

  } catch (error) {
    console.error('GET attendance history error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}