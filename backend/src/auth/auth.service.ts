import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        console.log('[AuthService] Validating user:', email);
        const user = await this.usersService.findOne(email);
        console.log('[AuthService] User found:', user ? `Yes (ID: ${user.id})` : 'No');
        if (user && (await bcrypt.compare(pass, user.password))) {
            console.log('[AuthService] Password match: Yes');
            const { password, ...result } = user;
            return result;
        }
        console.log('[AuthService] Authentication failed');
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
