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

  async sendPasswordResetEmail(to: string, name: string, token: string) {
    const resetUrl = `${this.configService.frontendUrl}/redefinir-senha?token=${token}`;
    const htmlBody = `
    <div style="
      font-family: Arial, sans-serif;
      background-color: #f9f9f9;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      max-width: 500px;
      margin: 0 auto;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      color: #333;
      line-height: 1.6;">
      <h3 style="color: #9333ea; font-size: 20px; margin-bottom: 15px;">
        Olá, ${name}!
      </h3>
      <p>Você solicitou a recuperação de senha. Clique no link abaixo para redefinir sua senha:</p>
      <a href="${resetUrl}" target="_blank" style="
        display: inline-block;
        color: #fff;
        background-color: #9333ea;
        text-decoration: none;
        padding: 10px 15px;
        border-radius: 5px;
        font-weight: bold;
        margin-top: 10px;
        word-break: break-word;">
        Redefinir Senha
      </a>
      <p style="color: #9333ea; text-decoration: none;">
      Caso o link não funcione,
      copie e cole o endereço abaixo em seu navegador.
      </p>
      <p>${resetUrl}</p>
      <p>O link é válido por 15 minutos.</p>
      <p>Se você não solicitou esta ação, por favor ignore este e-mail.</p>
      <br />
      <p>Atenciosamente,</p>
      <p style="font-size: 14px; color: #555;">Equipe SporTickets</p>
    </div>
    `;

    return this.sendMail(to, name, 'Recuperação de senha', htmlBody);
  }
}
