import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query as QueryParam } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('stats')
    @Roles(Role.ADMIN)
    getStats() {
        return this.usersService.getStats();
    }

    @Get()
    @Roles(Role.ADMIN)
    findAll(@QueryParam('page') page: number = 1, @QueryParam('limit') limit: number = 10, @QueryParam('search') search?: string) {
        return this.usersService.findAll(+page, +limit, search);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOneById(+id);
    }

    @Patch(':id')
    @Roles(Role.ADMIN)
    update(@Param('id') id: string, @Body() updateUserDto: any) {
        return this.usersService.update(+id, updateUserDto);
    }

    @Patch(':id/toggle-active')
    @Roles(Role.ADMIN)
    toggleActive(@Param('id') id: string) {
        return this.usersService.toggleActive(+id);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    remove(@Param('id') id: string) {
        return this.usersService.remove(+id);
    }

}
