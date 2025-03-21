import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config(); // Load environment variables


@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) throw new UnauthorizedException('Accès refusé.');

    const SECRET_KEY = process.env.SECRET_KEY;
    if (!SECRET_KEY) {
      throw new Error('SECRET_KEY is not defined. Please set it in your .env file.');
    }

    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      request.user = decoded;
      return true;
    } catch {
      throw new UnauthorizedException('Token invalide.');
    }
  }
}
