import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { events, users } from '@/db/schema';
import { eq, like, and, or, desc, asc, gte, lte } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const organizerId = searchParams.get('organizer_id');
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const sort = searchParams.get('sort') || 'eventDate';
    const order = searchParams.get('order') || 'desc';

    let query = db.select().from(events);
    let conditions = [];

    if (search) {
      conditions.push(
        or(
          like(events.title, `%${search}%`),
          like(events.location, `%${search}%`)
        )
      );
    }

    if (organizerId && !isNaN(parseInt(organizerId))) {
      conditions.push(eq(events.organizerId, parseInt(organizerId)));
    }

    if (status) {
      conditions.push(eq(events.status, status));
    }

    if (dateFrom) {
      conditions.push(gte(events.eventDate, dateFrom));
    }

    if (dateTo) {
      conditions.push(lte(events.eventDate, dateTo));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const orderDirection = order.toLowerCase() === 'asc' ? asc : desc;
    let sortColumn = events.eventDate; // default
    
    if (sort === 'title') sortColumn = events.title;
    else if (sort === 'createdAt') sortColumn = events.createdAt;
    else if (sort === 'status') sortColumn = events.status;

    const results = await query
      .orderBy(orderDirection(sortColumn))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    if (user.role !== 'organizer') {
      return NextResponse.json({ 
        error: 'Organizer role required to create events',
        code: 'INSUFFICIENT_PERMISSIONS' 
      }, { status: 403 });
    }

    const requestBody = await request.json();
    
    // Security check: reject if user ID fields provided in body
    if ('organizerId' in requestBody || 'organizer_id' in requestBody || 'userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { title, description, eventDate, location, maxAttendees, status = 'published' } = requestBody;

    // Validate required fields
    if (!title || title.trim() === '') {
      return NextResponse.json({ 
        error: "Title is required",
        code: "MISSING_TITLE" 
      }, { status: 400 });
    }

    if (!eventDate) {
      return NextResponse.json({ 
        error: "Event date is required",
        code: "MISSING_EVENT_DATE" 
      }, { status: 400 });
    }

    // Validate eventDate is a valid ISO date string
    const parsedDate = new Date(eventDate);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ 
        error: "Event date must be a valid ISO date string",
        code: "INVALID_DATE_FORMAT" 
      }, { status: 400 });
    }

    // Validate maxAttendees if provided
    if (maxAttendees !== undefined && maxAttendees !== null) {
      if (!Number.isInteger(maxAttendees) || maxAttendees <= 0) {
        return NextResponse.json({ 
          error: "Max attendees must be a positive integer",
          code: "INVALID_MAX_ATTENDEES" 
        }, { status: 400 });
      }
    }

    // Validate status
    const validStatuses = ['draft', 'published', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: "Status must be one of: draft, published, cancelled",
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    const now = new Date().toISOString();
    const newEvent = await db.insert(events)
      .values({
        title: title.trim(),
        description: description?.trim() || null,
        eventDate: parsedDate.toISOString(),
        location: location?.trim() || null,
        maxAttendees: maxAttendees || null,
        organizerId: user.id,
        status,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    return NextResponse.json(newEvent[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if event exists and user has permission
    const existingEvent = await db.select()
      .from(events)
      .where(eq(events.id, parseInt(id)))
      .limit(1);

    if (existingEvent.length === 0) {
      return NextResponse.json({ 
        error: 'Event not found' 
      }, { status: 404 });
    }

    // Only organizers can update events, and only their own events
    if (user.role !== 'organizer' || existingEvent[0].organizerId !== user.id) {
      return NextResponse.json({ 
        error: 'Insufficient permissions to update this event',
        code: 'INSUFFICIENT_PERMISSIONS' 
      }, { status: 403 });
    }

    const requestBody = await request.json();
    
    // Security check: reject if user ID fields provided in body
    if ('organizerId' in requestBody || 'organizer_id' in requestBody || 'userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { title, description, eventDate, location, maxAttendees, status } = requestBody;
    const updates: any = { updatedAt: new Date().toISOString() };

    if (title !== undefined) {
      if (!title || title.trim() === '') {
        return NextResponse.json({ 
          error: "Title cannot be empty",
          code: "INVALID_TITLE" 
        }, { status: 400 });
      }
      updates.title = title.trim();
    }

    if (description !== undefined) {
      updates.description = description?.trim() || null;
    }

    if (eventDate !== undefined) {
      const parsedDate = new Date(eventDate);
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json({ 
          error: "Event date must be a valid ISO date string",
          code: "INVALID_DATE_FORMAT" 
        }, { status: 400 });
      }
      updates.eventDate = parsedDate.toISOString();
    }

    if (location !== undefined) {
      updates.location = location?.trim() || null;
    }

    if (maxAttendees !== undefined) {
      if (maxAttendees !== null && (!Number.isInteger(maxAttendees) || maxAttendees <= 0)) {
        return NextResponse.json({ 
          error: "Max attendees must be a positive integer or null",
          code: "INVALID_MAX_ATTENDEES" 
        }, { status: 400 });
      }
      updates.maxAttendees = maxAttendees;
    }

    if (status !== undefined) {
      const validStatuses = ['draft', 'published', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ 
          error: "Status must be one of: draft, published, cancelled",
          code: "INVALID_STATUS" 
        }, { status: 400 });
      }
      updates.status = status;
    }

    const updated = await db.update(events)
      .set(updates)
      .where(eq(events.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if event exists and user has permission
    const existingEvent = await db.select()
      .from(events)
      .where(eq(events.id, parseInt(id)))
      .limit(1);

    if (existingEvent.length === 0) {
      return NextResponse.json({ 
        error: 'Event not found' 
      }, { status: 404 });
    }

    // Only organizers can delete events, and only their own events
    if (user.role !== 'organizer' || existingEvent[0].organizerId !== user.id) {
      return NextResponse.json({ 
        error: 'Insufficient permissions to delete this event',
        code: 'INSUFFICIENT_PERMISSIONS' 
      }, { status: 403 });
    }

    const deleted = await db.delete(events)
      .where(eq(events.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Event deleted successfully',
      event: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}