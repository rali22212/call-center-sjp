
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({
            usernameField: 'email', // Use 'email' field instead of 'username'
            passwordField: 'password',
        });
    }

    async validate(email: string, pass: string): Promise<any> {
        console.log('[LocalStrategy] validate called with email:', email);
        const user = await this.authService.validateUser(email, pass);
        console.log('[LocalStrategy] validateUser returned:', user ? `User ID ${user.id}` : 'null');
        if (!user) {
            console.log('[LocalStrategy] Throwing UnauthorizedException');
            throw new UnauthorizedException();
        }
        console.log('[LocalStrategy] Returning user to request');
        return user;
    }
}
