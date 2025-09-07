import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { registrations, events, users } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const status = searchParams.get('status');
    const sort = searchParams.get('sort') || 'registrationDate';
    const order = searchParams.get('order') || 'desc';
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Validate eventId parameter
    if (!eventId || isNaN(parseInt(eventId))) {
      return NextResponse.json({ 
        error: "Valid event ID is required",
        code: "INVALID_EVENT_ID" 
      }, { status: 400 });
    }

    const eventIdInt = parseInt(eventId);

    // Check if event exists and user is the organizer
    const event = await db.select()
      .from(events)
      .where(eq(events.id, eventIdInt))
      .limit(1);

    if (event.length === 0) {
      return NextResponse.json({ 
        error: 'Event not found',
        code: "EVENT_NOT_FOUND" 
      }, { status: 404 });
    }

    if (event[0].organizerId !== user.id) {
      return NextResponse.json({ 
        error: 'Access denied. You are not the organizer of this event',
        code: "ACCESS_DENIED" 
      }, { status: 403 });
    }

    // Build query with joins
    let query = db.select({
      id: registrations.id,
      eventId: registrations.eventId,
      userId: registrations.userId,
      registrationDate: registrations.registrationDate,
      status: registrations.status,
      createdAt: registrations.createdAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role
      }
    })
    .from(registrations)
    .innerJoin(users, eq(registrations.userId, users.id))
    .where(eq(registrations.eventId, eventIdInt));

    // Apply status filter if provided
    if (status && (status === 'registered' || status === 'cancelled')) {
      query = query.where(and(
        eq(registrations.eventId, eventIdInt),
        eq(registrations.status, status)
      ));
    }

    // Apply sorting
    const sortColumn = sort === 'registrationDate' ? registrations.registrationDate : registrations.createdAt;
    const orderDirection = order === 'asc' ? asc : desc;
    query = query.orderBy(orderDirection(sortColumn));

    // Get total count for pagination
    let countQuery = db.select({ count: registrations.id })
      .from(registrations)
      .where(eq(registrations.eventId, eventIdInt));

    if (status && (status === 'registered' || status === 'cancelled')) {
      countQuery = countQuery.where(and(
        eq(registrations.eventId, eventIdInt),
        eq(registrations.status, status)
      ));
    }

    const [results, countResult] = await Promise.all([
      query.limit(limit).offset(offset),
      countQuery
    ]);

    const totalCount = countResult.length;

    return NextResponse.json({
      registrations: results,
      totalCount,
      limit,
      offset
    });

  } catch (error) {
    console.error('GET registrations error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}