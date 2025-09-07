import { db } from '@/db';
import { attendance } from '@/db/schema';

async function main() {
    const sampleAttendance = [
        // Event 1 (React Workshop - March 2024) - Registration IDs 1, 2, 3
        {
            registrationId: 1,
            isPresent: true,
            markedAt: new Date('2024-03-15T10:30:00Z').toISOString(),
            markedBy: 2,
            notes: 'Active participant, asked great questions during the workshop'
        },
        {
            registrationId: 2,
            isPresent: true,
            markedAt: new Date('2024-03-15T10:35:00Z').toISOString(),
            markedBy: 2,
            notes: null
        },
        {
            registrationId: 3,
            isPresent: false,
            markedAt: new Date('2024-03-15T11:00:00Z').toISOString(),
            markedBy: 2,
            notes: 'No-show, did not respond to confirmation email'
        },

        // Event 2 (Digital Marketing - May 2024) - Registration IDs 4, 5, 6, 7, 8
        {
            registrationId: 4,
            isPresent: true,
            markedAt: new Date('2024-05-20T09:15:00Z').toISOString(),
            markedBy: 3,
            notes: 'Arrived early, very engaged throughout the session'
        },
        {
            registrationId: 5,
            isPresent: true,
            markedAt: new Date('2024-05-20T09:20:00Z').toISOString(),
            markedBy: 3,
            notes: null
        },
        {
            registrationId: 6,
            isPresent: true,
            markedAt: new Date('2024-05-20T09:25:00Z').toISOString(),
            markedBy: 3,
            notes: 'Brought a colleague who also showed interest'
        },
        {
            registrationId: 7,
            isPresent: false,
            markedAt: new Date('2024-05-20T09:30:00Z').toISOString(),
            markedBy: 3,
            notes: 'Called in sick on the day of the event'
        },
        {
            registrationId: 8,
            isPresent: true,
            markedAt: new Date('2024-05-20T09:45:00Z').toISOString(),
            markedBy: 3,
            notes: null
        },

        // Event 4 (Community Meetup - February 2024) - Registration IDs 10, 11, 12
        {
            registrationId: 10,
            isPresent: true,
            markedAt: new Date('2024-02-10T14:00:00Z').toISOString(),
            markedBy: 4,
            notes: 'Great networking, connected with several other attendees'
        },
        {
            registrationId: 11,
            isPresent: true,
            markedAt: new Date('2024-02-10T14:10:00Z').toISOString(),
            markedBy: 4,
            notes: null
        },
        {
            registrationId: 12,
            isPresent: false,
            markedAt: new Date('2024-02-10T14:30:00Z').toISOString(),
            markedBy: 4,
            notes: 'Last minute work emergency prevented attendance'
        }
    ];

    await db.insert(attendance).values(sampleAttendance);
    
    console.log('✅ Attendance seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});