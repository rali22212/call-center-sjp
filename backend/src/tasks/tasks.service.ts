import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Task } from '@prisma/client';

@Injectable()
export class TasksService {
    constructor(private prisma: PrismaService) { }

    async create(data: Prisma.TaskUncheckedCreateInput): Promise<Task> {
        return this.prisma.task.create({ data });
    }

    async findAll(queryId?: number): Promise<Task[]> {
        const where: Prisma.TaskWhereInput = {};
        if (queryId) {
            where.queryId = queryId;
        }
        return this.prisma.task.findMany({ where });
    }

    async findOne(id: number): Promise<Task | null> {
        return this.prisma.task.findUnique({ where: { id } });
    }

    async update(id: number, data: Prisma.TaskUpdateInput): Promise<Task> {
        return this.prisma.task.update({
            where: { id },
            data,
        });
    }

    async remove(id: number): Promise<Task> {
        return this.prisma.task.delete({ where: { id } });
    }
}
