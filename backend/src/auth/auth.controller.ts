import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private usersService: UsersService,
    ) { }

    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Request() req: any) {
        console.log('[AuthController] login method called with user:', req.user);
        const result = this.authService.login(req.user);
        console.log('[AuthController] login result:', result);
        return result;
    }

    @Post('register')
    async register(@Body() userData: any) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        return this.usersService.create({
            ...userData,
            password: hashedPassword,
        });
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('profile')
    getProfile(@Request() req: any) {
        return req.user;
    }
}
