import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { events, registrations } from '@/db/schema';
import { eq, like, and, or, desc, asc, gte, lte, count, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Search and filters
    const search = searchParams.get('search');
    const locationFilter = searchParams.get('location');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const includePast = searchParams.get('include_past') === 'true';
    
    // Sorting
    const sortField = searchParams.get('sort') || 'eventDate';
    const sortOrder = searchParams.get('order') || 'asc';
    
    // Validate pagination parameters
    if (isNaN(limit) || isNaN(offset) || limit < 1 || offset < 0) {
      return NextResponse.json({ 
        error: "Invalid pagination parameters",
        code: "INVALID_PAGINATION" 
      }, { status: 400 });
    }
    
    // Validate sort parameters
    const validSortFields = ['eventDate', 'title', 'createdAt'];
    if (!validSortFields.includes(sortField)) {
      return NextResponse.json({ 
        error: "Invalid sort field. Must be one of: eventDate, title, createdAt",
        code: "INVALID_SORT_FIELD" 
      }, { status: 400 });
    }
    
    if (sortOrder !== 'asc' && sortOrder !== 'desc') {
      return NextResponse.json({ 
        error: "Invalid sort order. Must be 'asc' or 'desc'",
        code: "INVALID_SORT_ORDER" 
      }, { status: 400 });
    }
    
    // Validate date parameters
    if (dateFrom && isNaN(Date.parse(dateFrom))) {
      return NextResponse.json({ 
        error: "Invalid date_from format. Use YYYY-MM-DD",
        code: "INVALID_DATE_FROM" 
      }, { status: 400 });
    }
    
    if (dateTo && isNaN(Date.parse(dateTo))) {
      return NextResponse.json({ 
        error: "Invalid date_to format. Use YYYY-MM-DD",
        code: "INVALID_DATE_TO" 
      }, { status: 400 });
    }
    
    // Build where conditions
    const whereConditions = [];
    
    // Only published events
    whereConditions.push(eq(events.status, 'published'));
    
    // Filter out past events by default
    if (!includePast) {
      const today = new Date().toISOString().split('T')[0];
      whereConditions.push(gte(events.eventDate, today));
    }
    
    // Search in title, description, and location
    if (search) {
      const searchTerm = `%${search}%`;
      whereConditions.push(
        or(
          like(events.title, searchTerm),
          like(events.description, searchTerm),
          like(events.location, searchTerm)
        )
      );
    }
    
    // Location filter
    if (locationFilter) {
      whereConditions.push(like(events.location, `%${locationFilter}%`));
    }
    
    // Date range filters
    if (dateFrom) {
      whereConditions.push(gte(events.eventDate, dateFrom));
    }
    
    if (dateTo) {
      whereConditions.push(lte(events.eventDate, dateTo));
    }
    
    // Combine all where conditions
    const whereClause = whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0];
    
    // Build the main query with registration count
    const query = db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        eventDate: events.eventDate,
        location: events.location,
        maxAttendees: events.maxAttendees,
        registrationCount: sql<number>`COALESCE(${sql`(
          SELECT COUNT(*) 
          FROM ${registrations} 
          WHERE ${registrations.eventId} = ${events.id} 
          AND ${registrations.status} = 'registered'
        )`}, 0)`.as('registrationCount')
      })
      .from(events)
      .where(whereClause);
    
    // Apply sorting
    if (sortField === 'eventDate') {
      query.orderBy(sortOrder === 'asc' ? asc(events.eventDate) : desc(events.eventDate));
    } else if (sortField === 'title') {
      query.orderBy(sortOrder === 'asc' ? asc(events.title) : desc(events.title));
    } else if (sortField === 'createdAt') {
      query.orderBy(sortOrder === 'asc' ? asc(events.createdAt) : desc(events.createdAt));
    }
    
    // Apply pagination
    const results = await query.limit(limit).offset(offset);
    
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}