import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class SwaggerAuthMiddleware implements NestMiddleware {
  private readonly username: string;
  private readonly password: string;

  constructor() {
    this.username = process.env.SWAGGER_USERNAME!;
    this.password = process.env.SWAGGER_PASSWORD!;
    if (!this.username || !this.password) {
      throw new Error('Missing Swagger Basic Auth credentials.');
    }
  }

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const authHeader = req.get('authorization');

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return this.sendUnauthorized(res);
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString(
      'ascii',
    );
    const [username, password] = credentials.split(':');

    if (username !== this.username || password !== this.password) {
      return this.sendUnauthorized(res);
    }

    next();
  }

  private sendUnauthorized(res: Response): void {
    res.setHeader('WWW-Authenticate', 'Basic realm="Swagger Docs"');
    res.status(401).send('Unauthorized');
  }
}
