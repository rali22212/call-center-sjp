import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query as QueryParam } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('categories')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Post()
    @Roles(Role.ADMIN)
    create(@Body() createCategoryDto: any) {
        return this.categoriesService.create(createCategoryDto);
    }

    @Get('stats')
    @Roles(Role.ADMIN)
    getStats() {
        return this.categoriesService.getStats();
    }

    @Get()
    findAll(@QueryParam('page') page: number = 1, @QueryParam('limit') limit: number = 10, @QueryParam('search') search?: string) {
        return this.categoriesService.findAll(+page, +limit, search);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.categoriesService.findOne(+id);
    }

    @Patch(':id')
    @Roles(Role.ADMIN)
    update(@Param('id') id: string, @Body() updateCategoryDto: any) {
        return this.categoriesService.update(+id, updateCategoryDto);
    }

    @Patch(':id/toggle-hidden')
    @Roles(Role.ADMIN)
    toggleHidden(@Param('id') id: string) {
        return this.categoriesService.toggleHidden(+id);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    remove(@Param('id') id: string) {
        return this.categoriesService.remove(+id);
    }
}
