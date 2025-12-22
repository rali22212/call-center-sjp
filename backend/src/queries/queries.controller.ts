import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query as QueryParam } from '@nestjs/common';
import { QueriesService } from './queries.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('queries')
@UseGuards(AuthGuard('jwt'))
export class QueriesController {
    constructor(private readonly queriesService: QueriesService) { }

    @Post()
    create(@Body() createQueryDto: any) {
        return this.queriesService.create(createQueryDto);
    }

    @Get()
    findAll(@QueryParam('status') status?: string) {
        return this.queriesService.findAll(status);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.queriesService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateQueryDto: any) {
        return this.queriesService.update(+id, updateQueryDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.queriesService.remove(+id);
    }
}
