import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['authorization'];
    const validToken = this.configService.get<string>('API_TOKEN');

    if (!token || token !== validToken) {
      throw new UnauthorizedException('Invalid or missing token');
    }

    next();
  }
}
