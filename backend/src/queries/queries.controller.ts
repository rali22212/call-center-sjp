import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query as QueryParam, Request } from '@nestjs/common';
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

    @Get('stats')
    getStats(@Request() req?: any) {
        return this.queriesService.getStats(req.user);
    }

    @Get()
    findAll(
        @QueryParam('status') status?: string,
        @QueryParam('search') search?: string,
        @QueryParam('page') page: number = 1,
        @QueryParam('limit') limit: number = 10,
        @QueryParam('startDate') startDate?: string,
        @QueryParam('endDate') endDate?: string,
        @QueryParam('userId') userId?: string,
        @Request() req?: any,
    ) {
        return this.queriesService.findAll(status, search, req.user, +page, +limit, startDate, endDate, userId ? +userId : undefined);
    }

    @Get('by-number/:complaintNumber')
    findByComplaintNumber(@Param('complaintNumber') complaintNumber: string) {
        // This endpoint is usually public or for tracking, currently no restriction but could be added
        return this.queriesService.findByComplaintNumber(complaintNumber);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req?: any) {
        return this.queriesService.findOne(+id, req.user);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateQueryDto: any, @Request() req?: any) {
        return this.queriesService.update(+id, updateQueryDto, req.user);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req?: any) {
        return this.queriesService.remove(+id, req.user);
    }
}
