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

  async sendTicketConfirmation(ticket: any) {
    const {
      user,
      ticketLot,
      category,
      team,
      price,
      codeBase64,
      personalizedFieldAnswers,
    } = ticket;

    const ticketType = ticketLot.ticketType;
    const event = ticketType.event;

    let personalizedFieldsHtml = '';
    if (personalizedFieldAnswers?.length > 0) {
      personalizedFieldsHtml = `
      <h4>Informações Personalizadas:</h4>
      <ul>
        ${personalizedFieldAnswers
          .map(
            (answer) =>
              `<li><strong>${answer.personalizedField.requestTitle}:</strong> ${answer.answer}</li>`,
          )
          .join('')}
      </ul>
    `;
    }

    const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #9333ea;">Ingresso Confirmado - ${ticketType.name}</h2>
      <p>Olá ${user.name},</p>
      <p>Seu ingresso foi confirmado com sucesso para o evento <strong>${event.name}</strong>.</p>

      <h4>Detalhes do Ingresso:</h4>
      <ul>
        <li><strong>Categoria:</strong> ${category.title}</li>
        <li><strong>Lote:</strong> ${ticketLot.name}</li>
        <li><strong>Preço:</strong> R$ ${price.toFixed(2)}</li>
        ${team ? `<li><strong>Equipe:</strong> ${team.id}</li>` : ''}
      </ul>

      ${personalizedFieldsHtml}

      <h4>QR Code do Ingresso:</h4>
      <img src="${codeBase64}" alt="QR Code do ingresso" style="max-width: 200px;" />

      <br /><br />
      <p>Nos vemos no evento! 🎉</p>
      <p>Atenciosamente,<br />Equipe SporTickets</p>
    </div>
  `;

    await this.sendMail(
      user.email,
      user.name,
      `Seu ingresso para ${event.name} foi confirmado!`,
      htmlBody,
    );
  }
}
