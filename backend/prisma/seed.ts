import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@test.com' },
        update: {},
        create: {
            email: 'admin@test.com',
            password: hashedPassword,
            name: 'System Admin',
            role: 'ADMIN',
        },
    });
    console.log('✅ Admin user created:', admin.email);

    // Create categories
    const technical = await prisma.category.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: 'Technical Support',
        },
    });
    console.log('✅ Category created:', technical.name);

    const billing = await prisma.category.upsert({
        where: { id: 2 },
        update: {},
        create: {
            name: 'Billing Issues',
        },
    });
    console.log('✅ Category created:', billing.name);

    const general = await prisma.category.upsert({
        where: { id: 3 },
        update: {},
        create: {
            name: 'General Inquiry',
        },
    });
    console.log('✅ Category created:', general.name);

    const complaint = await prisma.category.upsert({
        where: { id: 4 },
        update: {},
        create: {
            name: 'Complaint',
        },
    });
    console.log('✅ Category created:', complaint.name);

    console.log('✅ Seeding completed!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
