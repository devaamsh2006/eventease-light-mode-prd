import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { registrations, events } from '@/db/schema';
import { eq, and, desc, asc, gte, lt } from 'drizzle-orm';
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
    const status = searchParams.get('status');
    const upcoming = searchParams.get('upcoming') === 'true';
    const past = searchParams.get('past') === 'true';
    
    // Sort parameters
    const sort = searchParams.get('sort') || 'eventDate';
    const order = searchParams.get('order') || 'desc';

    // Validate sort field
    const validSortFields = ['registrationDate', 'eventDate'];
    if (!validSortFields.includes(sort)) {
      return NextResponse.json({ 
        error: 'Invalid sort field. Must be one of: registrationDate, eventDate',
        code: 'INVALID_SORT_FIELD'
      }, { status: 400 });
    }

    // Validate order
    if (order !== 'asc' && order !== 'desc') {
      return NextResponse.json({ 
        error: 'Invalid order. Must be asc or desc',
        code: 'INVALID_ORDER'
      }, { status: 400 });
    }

    // Validate status filter
    const validStatuses = ['registered', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status. Must be one of: registered, cancelled',
        code: 'INVALID_STATUS'
      }, { status: 400 });
    }

    // Validate time filters
    if (upcoming && past) {
      return NextResponse.json({ 
        error: 'Cannot filter for both upcoming and past events',
        code: 'CONFLICTING_TIME_FILTERS'
      }, { status: 400 });
    }

    // Build query
    let query = db.select({
      id: registrations.id,
      eventId: registrations.eventId,
      userId: registrations.userId,
      registrationDate: registrations.registrationDate,
      status: registrations.status,
      createdAt: registrations.createdAt,
      event: {
        id: events.id,
        title: events.title,
        description: events.description,
        eventDate: events.eventDate,
        location: events.location,
        maxAttendees: events.maxAttendees,
        status: events.status,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt
      }
    }).from(registrations)
      .innerJoin(events, eq(registrations.eventId, events.id));

    // Build where conditions
    const conditions = [eq(registrations.userId, user.id)];

    // Add status filter
    if (status) {
      conditions.push(eq(registrations.status, status));
    }

    // Add time filters
    const currentDate = new Date().toISOString();
    if (upcoming) {
      conditions.push(gte(events.eventDate, currentDate));
    } else if (past) {
      conditions.push(lt(events.eventDate, currentDate));
    }

    // Apply where conditions
    query = query.where(and(...conditions));

    // Add sorting
    const sortField = sort === 'registrationDate' ? registrations.registrationDate : events.eventDate;
    const sortOrder = order === 'asc' ? asc(sortField) : desc(sortField);
    query = query.orderBy(sortOrder);

    // Apply pagination
    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET registrations error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}