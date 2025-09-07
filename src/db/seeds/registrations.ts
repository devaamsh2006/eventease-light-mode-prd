import { db } from '@/db';
import { registrations } from '@/db/schema';

async function main() {
    const sampleRegistrations = [
        // Event 1 (React Workshop) - 4 registrations
        {
            eventId: 1,
            userId: 3,
            registrationDate: new Date('2024-01-08').toISOString(),
            status: 'registered',
            createdAt: new Date('2024-01-08').toISOString(),
        },
        {
            eventId: 1,
            userId: 5,
            registrationDate: new Date('2024-01-10').toISOString(),
            status: 'registered',
            createdAt: new Date('2024-01-10').toISOString(),
        },
        {
            eventId: 1,
            userId: 7,
            registrationDate: new Date('2024-01-12').toISOString(),
            status: 'cancelled',
            createdAt: new Date('2024-01-12').toISOString(),
        },
        {
            eventId: 1,
            userId: 9,
            registrationDate: new Date('2024-01-14').toISOString(),
            status: 'registered',
            createdAt: new Date('2024-01-14').toISOString(),
        },

        // Event 2 (Digital Marketing) - 6 registrations (popular)
        {
            eventId: 2,
            userId: 2,
            registrationDate: new Date('2024-01-25').toISOString(),
            status: 'registered',
            createdAt: new Date('2024-01-25').toISOString(),
        },
        {
            eventId: 2,
            userId: 4,
            registrationDate: new Date('2024-01-27').toISOString(),
            status: 'registered',
            createdAt: new Date('2024-01-27').toISOString(),
        },
        {
            eventId: 2,
            userId: 6,
            registrationDate: new Date('2024-01-30').toISOString(),
            status: 'registered',
            createdAt: new Date('2024-01-30').toISOString(),
        },
        {
            eventId: 2,
            userId: 8,
            registrationDate: new Date('2024-02-02').toISOString(),
            status: 'registered',
            createdAt: new Date('2024-02-02').toISOString(),
        },
        {
            eventId: 2,
            userId: 10,
            registrationDate: new Date('2024-02-05').toISOString(),
            status: 'cancelled',
            createdAt: new Date('2024-02-05').toISOString(),
        },
        {
            eventId: 2,
            userId: 3,
            registrationDate: new Date('2024-02-08').toISOString(),
            status: 'registered',
            createdAt: new Date('2024-02-08').toISOString(),
        },

        // Event 3 (Python Bootcamp) - 3 registrations
        {
            eventId: 3,
            userId: 2,
            registrationDate: new Date('2024-02-15').toISOString(),
            status: 'registered',
            createdAt: new Date('2024-02-15').toISOString(),
        },
        {
            eventId: 3,
            userId: 7,
            registrationDate: new Date('2024-02-18').toISOString(),
            status: 'registered',
            createdAt: new Date('2024-02-18').toISOString(),
        },
        {
            eventId: 3,
            userId: 9,
            registrationDate: new Date('2024-02-22').toISOString(),
            status: 'cancelled',
            createdAt: new Date('2024-02-22').toISOString(),
        },

        // Event 4 (Community Meetup) - 5 registrations
        {
            eventId: 4,
            userId: 1,
            registrationDate: new Date('2024-03-05').toISOString(),
            status: 'registered',
            createdAt: new Date('2024-03-05').toISOString(),
        },
        {
            eventId: 4,
            userId: 4,
            registrationDate: new Date('2024-03-08').toISOString(),
            status: 'registered',
            createdAt: new Date('2024-03-08').toISOString(),
        },
        {
            eventId: 4,
            userId: 6,
            registrationDate: new Date('2024-03-10').toISOString(),
            status: 'registered',
            createdAt: new Date('2024-03-10').toISOString(),
        },
        {
            eventId: 4,
            userId: 8,
            registrationDate: new Date('2024-03-12').toISOString(),
            status: 'registered',
            createdAt: new Date('2024-03-12').toISOString(),
        },
        {
            eventId: 4,
            userId: 10,
            registrationDate: new Date('2024-03-14').toISOString(),
            status: 'cancelled',
            createdAt: new Date('2024-03-14').toISOString(),
        },

        // Event 5 (Leadership) - 2 registrations
        {
            eventId: 5,
            userId: 3,
            registrationDate: new Date('2024-03-25').toISOString(),
            status: 'registered',
            createdAt: new Date('2024-03-25').toISOString(),
        },
        {
            eventId: 5,
            userId: 5,
            registrationDate: new Date('2024-03-28').toISOString(),
            status: 'registered',
            createdAt: new Date('2024-03-28').toISOString(),
        },

        // Event 6 (Web Design) - 1 registration (draft status, fewer)
        {
            eventId: 6,
            userId: 7,
            registrationDate: new Date('2024-04-08').toISOString(),
            status: 'registered',
            createdAt: new Date('2024-04-08').toISOString(),
        },

        // Event 8 (Data Science) - 4 registrations
        {
            eventId: 8,
            userId: 2,
            registrationDate: new Date('2024-05-05').toISOString(),
            status: 'registered',
            createdAt: new Date('2024-05-05').toISOString(),
        },
        {
            eventId: 8,
            userId: 4,
            registrationDate: new Date('2024-05-08').toISOString(),
            status: 'registered',
            createdAt: new Date('2024-05-08').toISOString(),
        },
        {
            eventId: 8,
            userId: 6,
            registrationDate: new Date('2024-05-12').toISOString(),
            status: 'registered',
            createdAt: new Date('2024-05-12').toISOString(),
        },
        {
            eventId: 8,
            userId: 9,
            registrationDate: new Date('2024-05-15').toISOString(),
            status: 'cancelled',
            createdAt: new Date('2024-05-15').toISOString(),
        },

        // Event 10 (Freelancer) - 3 registrations
        {
            eventId: 10,
            userId: 1,
            registrationDate: new Date('2024-06-10').toISOString(),
            status: 'registered',
            createdAt: new Date('2024-06-10').toISOString(),
        },
        {
            eventId: 10,
            userId: 5,
            registrationDate: new Date('2024-06-15').toISOString(),
            status: 'registered',
            createdAt: new Date('2024-06-15').toISOString(),
        },
        {
            eventId: 10,
            userId: 8,
            registrationDate: new Date('2024-06-18').toISOString(),
            status: 'registered',
            createdAt: new Date('2024-06-18').toISOString(),
        }
    ];

    await db.insert(registrations).values(sampleRegistrations);
    
    console.log('✅ Registrations seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});