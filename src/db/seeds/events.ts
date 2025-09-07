import { db } from '@/db';
import { events } from '@/db/schema';

async function main() {
    const sampleEvents = [
        {
            title: 'React Workshop: Building Modern Apps',
            description: 'Learn to build modern, responsive web applications using React 18 and the latest hooks. This hands-on workshop covers component design, state management, and best practices for production apps.',
            eventDate: new Date('2024-03-15T09:00:00Z').toISOString(),
            location: 'TechHub Conference Center, San Francisco',
            maxAttendees: 50,
            organizerId: 2,
            status: 'published',
            createdAt: new Date('2024-02-01').toISOString(),
            updatedAt: new Date('2024-02-15').toISOString(),
        },
        {
            title: 'Digital Marketing Conference 2024',
            description: 'Join industry leaders to explore the latest trends in digital marketing, SEO strategies, and social media advertising. Network with professionals and discover new tools to grow your business.',
            eventDate: new Date('2024-05-20T08:30:00Z').toISOString(),
            location: 'Grand Convention Hall, New York',
            maxAttendees: 200,
            organizerId: 3,
            status: 'published',
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-04-10').toISOString(),
        },
        {
            title: 'Python for Beginners Bootcamp',
            description: 'A comprehensive 3-day bootcamp designed for complete beginners. Learn Python fundamentals, data structures, and build your first web scraper and automation scripts.',
            eventDate: new Date('2024-07-08T10:00:00Z').toISOString(),
            location: 'Code Academy, Austin',
            maxAttendees: 30,
            organizerId: 4,
            status: 'published',
            createdAt: new Date('2024-05-20').toISOString(),
            updatedAt: new Date('2024-06-15').toISOString(),
        },
        {
            title: 'Community Meetup: Networking Night',
            description: 'Monthly networking event for local professionals and entrepreneurs. Enjoy casual conversations, share experiences, and build meaningful connections in a relaxed atmosphere.',
            eventDate: new Date('2024-02-28T18:00:00Z').toISOString(),
            location: 'Downtown Co-working Space, Portland',
            maxAttendees: null,
            organizerId: 2,
            status: 'published',
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: new Date('2024-02-10').toISOString(),
        },
        {
            title: 'Leadership Training Workshop',
            description: 'Develop essential leadership skills through interactive exercises and real-world scenarios. Perfect for managers, team leads, and aspiring leaders looking to enhance their impact.',
            eventDate: new Date('2024-09-12T09:00:00Z').toISOString(),
            location: 'Business Excellence Center, Chicago',
            maxAttendees: 25,
            organizerId: 5,
            status: 'published',
            createdAt: new Date('2024-07-01').toISOString(),
            updatedAt: new Date('2024-08-15').toISOString(),
        },
        {
            title: 'Web Design Masterclass',
            description: 'Master the art of modern web design with hands-on sessions covering UI/UX principles, responsive design, and the latest design tools. Bring your creative vision to life.',
            eventDate: new Date('2024-11-05T13:00:00Z').toISOString(),
            location: 'Design Studio, Los Angeles',
            maxAttendees: 40,
            organizerId: 3,
            status: 'draft',
            createdAt: new Date('2024-09-10').toISOString(),
            updatedAt: new Date('2024-10-01').toISOString(),
        },
        {
            title: 'Startup Pitch Competition',
            description: 'Watch emerging startups compete for funding and mentorship opportunities. Innovative ideas meet experienced investors in this exciting showcase of entrepreneurial talent.',
            eventDate: new Date('2024-04-18T14:00:00Z').toISOString(),
            location: 'Innovation Hub, Boston',
            maxAttendees: 100,
            organizerId: 4,
            status: 'cancelled',
            createdAt: new Date('2024-02-20').toISOString(),
            updatedAt: new Date('2024-03-25').toISOString(),
        },
        {
            title: 'Data Science Summit',
            description: 'Explore cutting-edge developments in machine learning, AI, and big data analytics. Sessions feature case studies, technical workshops, and insights from industry experts.',
            eventDate: new Date('2024-10-22T09:30:00Z').toISOString(),
            location: 'University Conference Center, Seattle',
            maxAttendees: 150,
            organizerId: 2,
            status: 'published',
            createdAt: new Date('2024-08-01').toISOString(),
            updatedAt: new Date('2024-09-15').toISOString(),
        },
        {
            title: 'Mobile App Development Workshop',
            description: 'Learn to build cross-platform mobile applications using React Native. Cover navigation, state management, API integration, and deployment to app stores.',
            eventDate: new Date('2024-12-10T10:00:00Z').toISOString(),
            location: 'Tech Innovation Center, Denver',
            maxAttendees: 35,
            organizerId: 5,
            status: 'draft',
            createdAt: new Date('2024-10-15').toISOString(),
            updatedAt: new Date('2024-11-01').toISOString(),
        },
        {
            title: 'Freelancer Success Seminar',
            description: 'Essential strategies for building a successful freelance career including client acquisition, project management, pricing strategies, and maintaining work-life balance.',
            eventDate: new Date('2024-06-14T15:00:00Z').toISOString(),
            location: 'Freelancer Hub, Nashville',
            maxAttendees: null,
            organizerId: 3,
            status: 'published',
            createdAt: new Date('2024-04-20').toISOString(),
            updatedAt: new Date('2024-05-30').toISOString(),
        }
    ];

    await db.insert(events).values(sampleEvents);
    
    console.log('✅ Events seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});