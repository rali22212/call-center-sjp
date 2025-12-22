import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Category } from '@prisma/client';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    async create(data: Prisma.CategoryUncheckedCreateInput): Promise<Category> {
        return this.prisma.category.create({ data });
    }

    async findAll(): Promise<Category[]> {
        return this.prisma.category.findMany({
            include: { children: true }, // Load subcategories
        });
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

    async remove(id: number): Promise<Category> {
        return this.prisma.category.delete({ where: { id } });
    }
}
