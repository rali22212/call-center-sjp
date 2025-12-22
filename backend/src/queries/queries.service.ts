import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Query } from '@prisma/client';

@Injectable()
export class QueriesService {
    constructor(private prisma: PrismaService) { }

    async create(data: Prisma.QueryUncheckedCreateInput): Promise<Query> {
        this.validateCnic(data.cnic);
        return this.prisma.query.create({ data });
    }

    async findAll(status?: any): Promise<Query[]> {
        const where: Prisma.QueryWhereInput = {};
        if (status) {
            where.status = status;
        }
        return this.prisma.query.findMany({
            where,
            include: { category: true, user: true },
        });
    }

    async findOne(id: number): Promise<Query | null> {
        return this.prisma.query.findUnique({
            where: { id },
            include: { category: true, user: true, tasks: true, remarks: true },
        });
    }

    async update(id: number, data: Prisma.QueryUpdateInput): Promise<Query> {
        return this.prisma.query.update({
            where: { id },
            data,
        });
    }

    async remove(id: number): Promise<Query> {
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
