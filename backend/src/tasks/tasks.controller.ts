import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('tasks')
@UseGuards(AuthGuard('jwt'))
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Post()
    create(@Body() createTaskDto: any) {
        return this.tasksService.create(createTaskDto);
    }

    @Get()
    findAll(@Query('queryId') queryId?: string) {
        return this.tasksService.findAll(queryId ? +queryId : undefined);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tasksService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTaskDto: any) {
        return this.tasksService.update(+id, updateTaskDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.tasksService.remove(+id);
    }
}
