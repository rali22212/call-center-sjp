import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findOne(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({
            data,
        });
    }

    async findAll(page: number = 1, limit: number = 10, search?: string) {
        const where: Prisma.UserWhereInput = search ? {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ]
        } : {};

        const total = await this.prisma.user.count({ where });
        const lastPage = Math.ceil(total / limit) || 1;
        const safePage = Math.min(Math.max(page, 1), Math.max(lastPage, 1));
        const skip = (safePage - 1) * limit;

        const data = await this.prisma.user.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { queries: true }
                }
            },
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

    async findOneById(id: number): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    async update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }

    async toggleActive(id: number): Promise<User> {
        const user = await this.prisma.user.findUnique({ where: { id } });
        return this.prisma.user.update({
            where: { id },
            data: { isActive: !user?.isActive },
        });
    }

    async remove(id: number): Promise<User> {
        return this.prisma.user.delete({
            where: { id },
        });
    }
    async getStats() {
        const [total, active, disabled] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { isActive: true } }),
            this.prisma.user.count({ where: { isActive: false } }),
        ]);

        return {
            total,
            active,
            disabled,
        };
    }

    // Update user's lastActiveAt timestamp (call on login and API requests)
    async updateLastActive(userId: number): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: { lastActiveAt: new Date() },
        });
    }

    // Get count of users who were active in the last X minutes (default: 10)
    async getOnlineCount(minutesThreshold: number = 10): Promise<{ online: number; total: number }> {
        const threshold = new Date(Date.now() - minutesThreshold * 60 * 1000);

        const [online, total] = await Promise.all([
            this.prisma.user.count({
                where: {
                    lastActiveAt: { gte: threshold },
                    isActive: true,
                },
            }),
            this.prisma.user.count({ where: { isActive: true } }),
        ]);

        return { online, total };
    }

    // Update user password
    async updatePassword(id: number, hashedPassword: string): Promise<void> {
        await this.prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
        });
    }
}

