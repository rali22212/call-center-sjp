import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Query } from '@prisma/client';

@Injectable()
export class QueriesService {
    constructor(private prisma: PrismaService) { }

    /**
     * Generate a unique complaint number in format: CMP-YYMM-XXXXX
     */
    private async generateComplaintNumber(): Promise<string> {
        const now = new Date();
        const year = now.getFullYear().toString().slice(2); // "26"
        const month = (now.getMonth() + 1).toString().padStart(2, '0'); // "02"
        const prefix = `CMP-${year}${month}`; // "CMP-2602"

        // Atomic increment using upsert
        const counter = await this.prisma.sequenceCounter.upsert({
            where: { id: prefix },
            update: { lastValue: { increment: 1 } },
            create: { id: prefix, lastValue: 1 },
        });

        const sequence = counter.lastValue.toString().padStart(5, '0');
        return `${prefix}-${sequence}`; // "CMP-2602-00001"
    }

    async create(data: Prisma.QueryUncheckedCreateInput): Promise<Query> {
        this.validateCnic(data.cnic);

        // Auto-generate complaint number
        const complaintNumber = await this.generateComplaintNumber();

        return this.prisma.query.create({
            data: {
                ...data,
                complaintNumber,
            },
            include: { category: true, user: true },
        });
    }

    async findAll(status?: string, search?: string, user?: any, page: number = 1, limit: number = 10, startDate?: string, endDate?: string, filterUserId?: number) {
        const where: Prisma.QueryWhereInput = {};

        if (status && status !== 'ALL') {
            where.status = status as any;
        }

        // Search by complaint number, CNIC, or title
        if (search) {
            where.OR = [
                { complaintNumber: { contains: search, mode: 'insensitive' } },
                { cnic: { contains: search } },
                { title: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Filter by user role (Agents can only see their own queries)
        if (user && user.role !== 'ADMIN') {
            where.userId = user.userId;
        }

        // Admin filtering by specific user
        if (filterUserId && user && user.role === 'ADMIN') {
            where.userId = filterUserId;
        }

        // Date Range Filtering
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt.gte = new Date(startDate);
            }
            if (endDate) {
                // Set end date to end of the day
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                where.createdAt.lte = end;
            }
        }

        const total = await this.prisma.query.count({ where });
        const lastPage = Math.ceil(total / limit);
        const safePage = Math.min(Math.max(page, 1), Math.max(lastPage, 1));
        const skip = (safePage - 1) * limit;

        const data = await this.prisma.query.findMany({
            where,
            include: { category: true, user: true },
            orderBy: { createdAt: 'desc' },
            skip,
            take: Number(limit),
        });

        return {
            data,
            meta: {
                total,
                page: safePage,
                lastPage,
            }
        };
    }

    async getStats(user?: any) {
        const where: Prisma.QueryWhereInput = {};
        if (user && user.role !== 'ADMIN') {
            where.userId = user.userId;
        }

        const [total, statusGenerators, priorityGenerators] = await Promise.all([
            this.prisma.query.count({ where }),
            this.prisma.query.groupBy({
                by: ['status'],
                _count: { status: true },
                where,
            }),
            this.prisma.query.groupBy({
                by: ['priority'],
                _count: { priority: true },
                where,
            }),
        ]);

        const byStatus = statusGenerators.reduce((acc, curr) => ({ ...acc, [curr.status]: curr._count.status }), {
            PENDING: 0, IN_PROGRESS: 0, RESOLVED: 0, CLOSED: 0
        });

        const byPriority = priorityGenerators.reduce((acc, curr) => ({ ...acc, [curr.priority]: curr._count.priority }), {
            LOW: 0, MEDIUM: 0, HIGH: 0
        });

        return {
            total,
            byStatus,
            byPriority,
        };
    }

    async findOne(id: number, user?: any): Promise<Query | null> {
        const query = await this.prisma.query.findUnique({
            where: { id },
            include: { category: true, user: true, tasks: true, remarks: true },
        });

        if (!query) return null;

        // Check ownership
        if (user && user.role !== 'ADMIN' && query.userId !== user.userId) {
            throw new ForbiddenException('You do not have permission to view this query');
        }

        return query;
    }

    async findByComplaintNumber(complaintNumber: string): Promise<Query | null> {
        const query = await this.prisma.query.findUnique({
            where: { complaintNumber },
            include: { category: true, user: true, tasks: true, remarks: true },
        });

        if (!query) {
            throw new NotFoundException(`Query with complaint number ${complaintNumber} not found`);
        }

        return query;
    }

    async update(id: number, data: Prisma.QueryUpdateInput, user?: any): Promise<Query> {
        // Check ownership first
        const existingQuery = await this.findOne(id, user); // helper check
        if (!existingQuery) throw new NotFoundException('Query not found');

        // Prevent modification of complaint number
        if ('complaintNumber' in data) {
            delete (data as any).complaintNumber;
        }

        return this.prisma.query.update({
            where: { id },
            data,
            include: { category: true, user: true },
        });
    }

    async remove(id: number, user?: any): Promise<Query> {
        // Check ownership first
        await this.findOne(id, user); // uses shared logic

        return this.prisma.query.delete({
            where: { id },
        });
    }

    private validateCnic(cnic: string) {
        if (!/^\d{13}$/.test(cnic)) {
            throw new BadRequestException('CNIC must be exactly 13 digits');
        }
    }
}
