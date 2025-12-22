import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { RemarksService } from './remarks.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('remarks')
@UseGuards(AuthGuard('jwt'))
export class RemarksController {
    constructor(private readonly remarksService: RemarksService) { }

    @Post()
    create(@Request() req: any, @Body() createRemarkDto: any) {
        // Attach the user ID from the token to the remark
        return this.remarksService.create({
            ...createRemarkDto,
            userId: req.user.userId
        });
    }

    @Get()
    findAll(@Query('queryId') queryId: string) {
        return this.remarksService.findAll(+queryId);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.remarksService.remove(+id);
    }
}
