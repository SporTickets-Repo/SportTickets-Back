import { Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from 'src/config/config.service';
import { SendMailClient } from 'zeptomail';

@Injectable()
export class EmailService {
  private client: SendMailClient;
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: AppConfigService) {
    this.client = new SendMailClient({
      url: 'api.zeptomail.com/',
      token: this.configService.zeptoMailToken,
    });
  }

  async sendMail(to: string, name: string, subject: string, htmlBody: string) {
    try {
      const response = await this.client.sendMail({
        from: {
          address: 'noreply@sportickets.com.br',
          name: 'noreply',
        },
        to: [
          {
            email_address: {
              address: to,
              name: name,
            },
          },
        ],
        subject,
        htmlbody: htmlBody,
      });

      this.logger.log(`Email sent to ${to}`);
      return response;
    } catch (error) {
      this.logger.error(`Error sending email to ${to}`);
      this.logger.error(error);
    }
  }
}
