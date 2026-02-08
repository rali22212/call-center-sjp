import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Category } from '@prisma/client';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    async create(data: Prisma.CategoryUncheckedCreateInput): Promise<Category> {
        return this.prisma.category.create({ data });
    }

    async findAll(page: number = 1, limit: number = 10, search?: string) {
        const where: Prisma.CategoryWhereInput = search ? {
            name: { contains: search, mode: 'insensitive' }
        } : {};

        const total = await this.prisma.category.count({ where });
        const lastPage = Math.ceil(total / limit) || 1;
        const safePage = Math.min(Math.max(page, 1), Math.max(lastPage, 1));
        const skip = (safePage - 1) * limit;

        const data = await this.prisma.category.findMany({
            where,
            orderBy: { id: 'desc' },
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

    async findOne(id: number): Promise<Category | null> {
        return this.prisma.category.findUnique({
            where: { id },
            include: { children: true },
        });
    }

    async update(id: number, data: Prisma.CategoryUpdateInput): Promise<Category> {
        return this.prisma.category.update({
            where: { id },
            data,
        });
    }

    async toggleHidden(id: number): Promise<Category> {
        const category = await this.prisma.category.findUnique({ where: { id } });
        return this.prisma.category.update({
            where: { id },
            data: { isHidden: !category?.isHidden },
        });
    }

    async remove(id: number): Promise<Category> {
        return this.prisma.category.delete({ where: { id } });
    }
    async getStats() {
        const [total, visible, hidden] = await Promise.all([
            this.prisma.category.count(),
            this.prisma.category.count({ where: { isHidden: false } }),
            this.prisma.category.count({ where: { isHidden: true } }),
        ]);

        return {
            total,
            visible,
            hidden,
        };
    }
}
