import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) throw new UnauthorizedException('Accès refusé.');

    try {
      const decoded = jwt.verify(token, 'SECRET_KEY');
      request.user = decoded;
      return true;
    } catch {
      throw new UnauthorizedException('Token invalide.');
    }
  }
}
