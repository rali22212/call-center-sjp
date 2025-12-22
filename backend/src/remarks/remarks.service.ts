import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Remark } from '@prisma/client';

@Injectable()
export class RemarksService {
    constructor(private prisma: PrismaService) { }

    async create(data: Prisma.RemarkUncheckedCreateInput): Promise<Remark> {
        return this.prisma.remark.create({
            data,
            include: { user: true } // Return user info with the remark
        });
    }

    async findAll(queryId: number): Promise<Remark[]> {
        return this.prisma.remark.findMany({
            where: { queryId },
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    async remove(id: number): Promise<Remark> {
        return this.prisma.remark.delete({ where: { id } });
    }
}
