import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcrypt';

async function main() {
    const saltRounds = 12;
    const plainPassword = 'password123';
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    const sampleUsers = [
        {
            email: 'john.doe@company.com',
            name: 'John Doe',
            password: hashedPassword,
            role: 'user',
            createdAt: new Date('2024-01-15T09:00:00Z').toISOString(),
            updatedAt: new Date('2024-01-15T09:00:00Z').toISOString(),
        },
        {
            email: 'jane.smith@company.com',
            name: 'Jane Smith',
            password: hashedPassword,
            role: 'organizer',
            createdAt: new Date('2024-01-20T10:30:00Z').toISOString(),
            updatedAt: new Date('2024-01-20T10:30:00Z').toISOString(),
        },
        {
            email: 'mike.johnson@company.com',
            name: 'Mike Johnson',
            password: hashedPassword,
            role: 'user',
            createdAt: new Date('2024-02-01T14:15:00Z').toISOString(),
            updatedAt: new Date('2024-02-01T14:15:00Z').toISOString(),
        },
        {
            email: 'sarah.williams@company.com',
            name: 'Sarah Williams',
            password: hashedPassword,
            role: 'organizer',
            createdAt: new Date('2024-02-05T11:45:00Z').toISOString(),
            updatedAt: new Date('2024-02-05T11:45:00Z').toISOString(),
        },
        {
            email: 'david.brown@company.com',
            name: 'David Brown',
            password: hashedPassword,
            role: 'user',
            createdAt: new Date('2024-02-10T16:20:00Z').toISOString(),
            updatedAt: new Date('2024-02-10T16:20:00Z').toISOString(),
        },
        {
            email: 'lisa.davis@company.com',
            name: 'Lisa Davis',
            password: hashedPassword,
            role: 'user',
            createdAt: new Date('2024-02-15T13:30:00Z').toISOString(),
            updatedAt: new Date('2024-02-15T13:30:00Z').toISOString(),
        },
        {
            email: 'robert.wilson@company.com',
            name: 'Robert Wilson',
            password: hashedPassword,
            role: 'user',
            createdAt: new Date('2024-02-20T08:45:00Z').toISOString(),
            updatedAt: new Date('2024-02-20T08:45:00Z').toISOString(),
        },
        {
            email: 'emily.martinez@company.com',
            name: 'Emily Martinez',
            password: hashedPassword,
            role: 'organizer',
            createdAt: new Date('2024-02-25T12:00:00Z').toISOString(),
            updatedAt: new Date('2024-02-25T12:00:00Z').toISOString(),
        }
    ];

    await db.insert(users).values(sampleUsers);
    
    console.log('✅ Users seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});