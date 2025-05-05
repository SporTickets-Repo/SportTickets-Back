import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getRootMessage() {
    return {
      message: 'Not available',
      robots: 'noindex',
    };
  }
}
