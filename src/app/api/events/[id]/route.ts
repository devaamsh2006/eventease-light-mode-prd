import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { events, registrations, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = params.id;
    const includeRegistrations = searchParams.get('include') === 'registrations';

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Get the event first
    const eventRecord = await db.select()
      .from(events)
      .where(eq(events.id, parseInt(id)))
      .limit(1);

    if (eventRecord.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const event = eventRecord[0];

    // If registrations are requested, check if user is the organizer
    if (includeRegistrations) {
      if (event.organizerId !== user.id) {
        return NextResponse.json({ 
          error: 'Only event organizer can access registration details',
          code: 'INSUFFICIENT_PERMISSIONS' 
        }, { status: 403 });
      }

      // Get registrations with user details
      const registrationsWithUsers = await db.select({
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
      .where(eq(registrations.eventId, parseInt(id)));

      // Get total registration count
      const totalRegistrations = registrationsWithUsers.length;

      return NextResponse.json({
        ...event,
        registrations: registrationsWithUsers,
        totalRegistrations
      });
    }

    // For public access, just return basic event info
    return NextResponse.json(event);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}