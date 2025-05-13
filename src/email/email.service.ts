import { Injectable, Logger } from '@nestjs/common';
import type { TicketWithRelations } from 'src/checkout/dto/ticket-with-relations.dto';
import { AppConfigService } from 'src/config/config.service';
import { formatDate } from 'src/utils/format';
import { generatePdf, generateQrCodeBase64 } from 'src/utils/generate';
import { sanitizerHtml } from 'src/utils/html-sanitizer';
import { stripHtml } from 'src/utils/stripHtml';
import { SendMailClient } from 'zeptomail';

@Injectable()
export class EmailService {
  private client: SendMailClient;
  private readonly logger = new Logger(EmailService.name);

  private readonly brandColors = {
    primary: '#00E5FF',
    secondary: '#6A1B9A',
    accent: '#FF5722',
    light: '#f8f9fa',
    dark: '#212529',
    gray: '#6c757d',
  };

  private getEmailTemplate(content: string) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>SporTickets</title>
    </head>
    <body style="
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f4f4;
      color: #333333;">
      
      <div style="
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
        
        <!-- Cabeçalho -->
        <div style="
          background: linear-gradient(90deg, ${this.brandColors.primary} 0%, ${this.brandColors.secondary} 100%);
          padding: 20px;
          text-align: center;">
          <h1 style="
            margin: 0;
            color: white;
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 1px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.2);">
            SPOR<span style="color: #ffffff;">TICKETS</span>
          </h1>
        </div>
        
        <!-- Conteúdo -->
        <div style="padding: 30px 25px;">
          ${content}
        </div>
        
        <!-- Rodapé -->
        <div style="
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          border-top: 3px solid ${this.brandColors.primary};">
          <p style="
            margin: 0;
            color: #666;
            font-size: 14px;">
            &copy; ${new Date().getFullYear()} SporTickets. Todos os direitos reservados.
          </p>
          <p style="
            margin: 10px 0 0;
            color: #888;
            font-size: 12px;">
            Este é um email automático, por favor não responda.
          </p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  constructor(private readonly configService: AppConfigService) {
    this.client = new SendMailClient({
      url: 'https://api.zeptomail.com/',
      token: this.configService.zeptoMailToken,
    });
  }

  async sendMail(
    to: string,
    name: string,
    subject: string,
    htmlBody: string,
    attachments: {
      content: string;
      mime_type: string;
      name: string;
      content_id?: string;
      disposition?: 'inline' | 'attachment';
    }[] = [],
  ) {
    try {
      const response = await this.client.sendMail({
        from: {
          address: 'noreply@sportickets.com.br',
          name: 'SporTickets',
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
        htmlbody: this.getEmailTemplate(htmlBody),
        attachments,
      });

      this.logger.log(`Email sent to ${to}`);
      return response;
    } catch (error) {
      this.logger.error(`Error sending email to ${to}`);
      this.logger.error(error);
      return null;
    }
  }

  async sendPasswordResetEmail(to: string, name: string, token: string) {
    const resetUrl = `${this.configService.frontendUrl}/redefinir-senha?token=${token}`;
    const htmlBody = `
    <div>
      <h2 style="
        color: ${this.brandColors.secondary}; 
        font-size: 22px; 
        margin-bottom: 20px;
        border-bottom: 2px solid ${this.brandColors.primary};
        padding-bottom: 10px;">
        Recuperação de Senha
      </h2>
      
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
        Olá, <strong>${name}</strong>!
      </p>
      
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        Você solicitou a recuperação de senha. Clique no botão abaixo para redefinir sua senha:
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" target="_blank" style="
          display: inline-block;
          background: linear-gradient(90deg, ${this.brandColors.primary} 0%, ${this.brandColors.secondary} 100%);
          color: white;
          text-decoration: none;
          padding: 12px 25px;
          border-radius: 5px;
          font-weight: bold;
          font-size: 16px;
          text-transform: uppercase;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;">
          Redefinir Senha
        </a>
      </div>
      
      <p style="
        font-size: 14px; 
        line-height: 1.6; 
        margin: 20px 0;
        padding: 15px;
        background-color: #f8f9fa;
        border-left: 4px solid ${this.brandColors.accent};
        border-radius: 4px;">
        Caso o botão não funcione, copie e cole o endereço abaixo em seu navegador:
        <br>
        <a href="${resetUrl}" style="
          color: ${this.brandColors.secondary};
          word-break: break-all;
          text-decoration: none;
          font-weight: 500;">
          ${resetUrl}
        </a>
      </p>
      
      <p style="font-size: 14px; line-height: 1.6; color: #666;">
        O link é válido por <strong>15 minutos</strong>.
      </p>
      
      <p style="font-size: 14px; line-height: 1.6; color: #666; margin-top: 20px;">
        Se você não solicitou esta ação, por favor ignore este e-mail.
      </p>
      
      <div style="
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #eee;">
        <p style="font-size: 14px; margin: 0;">Atenciosamente,</p>
        <p style="
          font-size: 16px; 
          font-weight: bold; 
          margin: 5px 0 0;
          color: ${this.brandColors.secondary};">
          Equipe SporTickets
        </p>
      </div>
    </div>
    `;

    return this.sendMail(to, name, 'Recuperação de senha', htmlBody);
  }

  async sendTicketConfirmation(
    ticket: TicketWithRelations,
    customText: string | null = null,
  ) {
    const {
      user,
      ticketLot,
      category,
      team,
      price,
      code,
      personalizedFieldAnswers,
    } = ticket;

    const ticketType = ticketLot.ticketType;
    const event = ticketType.event;

    const safeCustomHtml = customText ? sanitizerHtml(customText) : '';

    const formattedStartDate = event.startDate
      ? formatDate(event.startDate.toString())
      : 'Data não disponível';
    const formattedEndDate = event.endDate
      ? formatDate(event.endDate.toString())
      : 'Data não disponível';

    let personalizedFieldsHtml = '';
    if (personalizedFieldAnswers?.length > 0) {
      personalizedFieldsHtml = `
      <div style="
        margin: 25px 0;
        padding: 15px;
        background-color: #f8f9fa;
        border-radius: 6px;
        border-left: 4px solid ${this.brandColors.primary};">
        <h3 style="
          color: ${this.brandColors.secondary};
          font-size: 18px;
          margin-top: 0;
          margin-bottom: 12px;">
          Informações Personalizadas
        </h3>
        <ul style="
          padding-left: 20px;
          margin: 0;">
          ${personalizedFieldAnswers
            .map(
              (answer) =>
                `<li style="margin-bottom: 8px;">
                  <strong style="color: ${this.brandColors.secondary};">${answer.personalizedField.requestTitle}:</strong> 
                  <span>${answer.answer}</span>
                </li>`,
            )
            .join('')}
        </ul>
      </div>
      `;
    }

    let teamInfoHtml = '';
    if (team && team.tickets && team.tickets.length > 0) {
      const memberListHtml = team.tickets
        .map(
          (t) =>
            `<li style="margin-bottom: 8px;">
              <span style="font-weight: 500;">${t.user.name}</span> 
              <span style="color: #666; font-size: 14px;">(${t.user.email})</span>
            </li>`,
        )
        .join('');

      teamInfoHtml = `
      <div style="margin: 25px 0;">
        <h3 style="
          color: ${this.brandColors.secondary};
          font-size: 18px;
          margin-top: 0;
          margin-bottom: 12px;
          border-bottom: 2px solid ${this.brandColors.primary};
          padding-bottom: 8px;">
          Membros da Equipe
        </h3>
        <ul style="
          padding-left: 20px;
          margin: 0;">
          ${memberListHtml}
        </ul>
      </div>
      `;
    }

    const emailHtmlBody = `
    <div>
      <h2 style="
        color: ${this.brandColors.secondary}; 
        font-size: 24px; 
        margin-bottom: 5px;
        text-align: center;">
        Ingresso Confirmado
      </h2>
      <h3 style="
        color: ${this.brandColors.primary}; 
        font-size: 20px; 
        margin-top: 0;
        margin-bottom: 25px;
        text-align: center;">
        ${ticketType.name}
      </h3>
      
      <p style="
        font-size: 16px; 
        line-height: 1.6; 
        margin-bottom: 20px;">
        Olá <strong>${user.name}</strong>,
      </p>

       ${
         safeCustomHtml && stripHtml(safeCustomHtml).length > 0
           ? `<div style="
    font-size: 16px; 
    line-height: 1.6; 
    margin-bottom: 25px;
    background-color: #f0f9ff;
    padding: 15px;
    border-radius: 6px;
    border-left: 4px solid ${this.brandColors.primary};" class="custom-text-container">
      <style>
        .custom-text-container h1 {
          color: ${this.brandColors.secondary};
          font-size: 24px;
          margin-top: 0;
          margin-bottom: 16px;
          border-bottom: 2px solid ${this.brandColors.primary};
          padding-bottom: 8px;
        }
        .custom-text-container h2 {
          color: ${this.brandColors.secondary};
          font-size: 20px;
          margin-top: 20px;
          margin-bottom: 12px;
        }
        .custom-text-container h3 {
          color: ${this.brandColors.secondary};
          font-size: 18px;
          margin-top: 16px;
          margin-bottom: 10px;
        }
        .custom-text-container p {
          margin-bottom: 16px;
          line-height: 1.6;
        }
        .custom-text-container a {
          color: ${this.brandColors.primary};
          text-decoration: none;
          font-weight: 500;
        }
        .custom-text-container a:hover {
          text-decoration: underline;
        }
        .custom-text-container ul, .custom-text-container ol {
          padding-left: 20px;
          margin-bottom: 16px;
        }
        .custom-text-container li {
          margin-bottom: 8px;
        }
        .custom-text-container strong {
          color: ${this.brandColors.secondary};
          font-weight: 600;
        }
        .custom-text-container em {
          font-style: italic;
        }
        .custom-text-container blockquote {
          border-left: 4px solid ${this.brandColors.accent};
          padding-left: 16px;
          margin-left: 0;
          color: #666;
          font-style: italic;
        }
        .custom-text-container code {
          font-family: monospace;
          background-color: #f1f1f1;
          padding: 2px 4px;
          border-radius: 3px;
          font-size: 14px;
        }
      </style>
      ${safeCustomHtml}
    </div>`
           : ''
       }

      
      <p style="
        font-size: 16px; 
        line-height: 1.6; 
        margin-bottom: 25px;
        background-color: #f0f9ff;
        padding: 15px;
        border-radius: 6px;
        border-left: 4px solid ${this.brandColors.primary};">
        Seu ingresso foi confirmado com sucesso para o evento 
        <strong style="color: ${this.brandColors.secondary};">${event.name}</strong>.
      </p>

      <div style="
        background-color: #f8f9fa;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 25px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
        <h3 style="
          color: ${this.brandColors.secondary};
          font-size: 18px;
          margin-top: 0;
          margin-bottom: 15px;
          border-bottom: 2px solid ${this.brandColors.primary};
          padding-bottom: 8px;">
          Detalhes do Ingresso
        </h3>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; width: 40%; color: #666;">Categoria:</td>
            <td style="padding: 8px 0; font-weight: 500;">${category?.title ?? 'Sem categoria'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; width: 40%; color: #666;">Lote:</td>
            <td style="padding: 8px 0; font-weight: 500;">${ticketLot.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; width: 40%; color: #666;">Preço:</td>
            <td style="padding: 8px 0; font-weight: 500;">R$ ${price.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; width: 40%; color: #666;">Código do Ingresso:</td>
            <td style="padding: 8px 0; font-weight: 500; font-family: monospace; font-size: 16px;">${code}</td>
          </tr>
        </table>
      </div>

      <div style="
  background-color: #f0f9ff;
  border-radius: 8px;
  padding: 20px;
  margin: 25px 0;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  border-left: 4px solid ${this.brandColors.accent};">
  <h3 style="
    color: ${this.brandColors.secondary};
    font-size: 18px;
    margin-top: 0;
    margin-bottom: 15px;
    border-bottom: 2px solid ${this.brandColors.primary};
    padding-bottom: 8px;">
    Informações do Evento
  </h3>
  
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 8px 0; width: 40%; color: #666;">Nome do Evento:</td>
      <td style="padding: 8px 0; font-weight: 500;">${event.name}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; width: 40%; color: #666;">Data:</td>
      <td style="padding: 8px 0; font-weight: 500;">${formattedStartDate} - ${formattedEndDate}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; width: 40%; color: #666;">Local:</td>
      <td colspan="2" style="padding: 8px 0; font-weight: 500;">
        ${event.place || 'Local não informado'}<br/>
        ${[
          event.address?.street,
          event.address?.number,
          event.address?.complement,
        ]
          .filter(Boolean)
          .join(', ')}<br/>
        ${[
          event.address?.neighborhood,
          event.address?.city,
          event.address?.state,
        ]
          .filter(Boolean)
          .join(' - ')}<br/>
        CEP: ${event.address?.zipCode || 'Não informado'}
      </td>
    </tr>
  </table>
</div>

      ${personalizedFieldsHtml}
      ${teamInfoHtml}

      <div style="
        text-align: center;
        margin: 30px 0 20px;
        padding: 20px;
        background-color: #f8f9fa;
        border-radius: 8px;">
        <h3 style="
          color: ${this.brandColors.secondary};
          font-size: 18px;
          margin-top: 0;
          margin-bottom: 15px;">
          QR Code do Ingresso
        </h3>
        <p style="
          color: #666;
          font-size: 14px;
          margin-bottom: 0;">
          Consulte o PDF anexo para visualizar o QR Code do seu ingresso.
        </p>
      </div>

      <div style="
        margin-top: 30px;
        text-align: center;
        padding: 15px;
        background: linear-gradient(90deg, ${this.brandColors.primary}22 0%, ${this.brandColors.secondary}22 100%);
        border-radius: 8px;">
        <p style="
          font-size: 18px;
          font-weight: bold;
          margin: 0;
          color: ${this.brandColors.secondary};">
          Nos vemos no evento! 🎉
        </p>
      </div>
      
      <div style="
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #eee;
        text-align: center;">
        <p style="font-size: 14px; margin: 0;">Atenciosamente,</p>
        <p style="
          font-size: 16px; 
          font-weight: bold; 
          margin: 5px 0 0;
          color: ${this.brandColors.secondary};">
          Equipe SporTickets
        </p>
      </div>
    </div>
    `;

    const qrCodeDataUrl = await generateQrCodeBase64(code as string);

    const qrCodePdfHtml = `
  <div style="text-align: center; margin: 20px 0;">
    <img src="${qrCodeDataUrl}" alt="QR Code do ingresso" style="max-width: 300px; width:300px; height:auto; border: 1px solid #eee; padding: 10px; border-radius: 8px;" />
  </div>
`;

    const pdfHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Ingresso SporTickets</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
          line-height: 1.6;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 3px solid ${this.brandColors.primary};
        }
        .header h1 {
          color: ${this.brandColors.secondary};
          margin-bottom: 5px;
        }
        .header h2 {
          color: ${this.brandColors.primary};
          margin-top: 0;
          font-size: 18px;
        }
        .event-name {
          font-size: 24px;
          font-weight: bold;
          color: ${this.brandColors.secondary};
          text-align: center;
          margin: 20px 0;
        }
        .ticket-details {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .ticket-details h3 {
          color: ${this.brandColors.secondary};
          border-bottom: 2px solid ${this.brandColors.primary};
          padding-bottom: 8px;
          margin-top: 0;
        }
        .detail-row {
          display: flex;
          margin-bottom: 10px;
        }
        .detail-label {
          width: 40%;
          color: #666;
        }
        .detail-value {
          width: 60%;
          font-weight: 500;
        }
        .qr-section {
          text-align: center;
          margin: 30px 0;
        }
        .qr-section h3 {
          color: ${this.brandColors.secondary};
          margin-bottom: 20px;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>SPORTICKETS</h1>
        <h2>Ingresso Confirmado - ${ticketType.name}</h2>
      </div>
      
      <div class="event-name">${event.name}</div>
      
      <p>Olá ${user.name},</p>
      <p>Seu ingresso foi confirmado com sucesso!</p>

      <div class="qr-section">
        <h3>QR Code do Ingresso</h3>
        ${qrCodePdfHtml}
      </div>
      
      <div class="ticket-details">
        <h3>Detalhes do Ingresso</h3>
        <div class="detail-row">
          <div class="detail-label">Categoria:</div>
          <div class="detail-value">${category?.title ?? 'Sem categoria'}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Lote:</div>
          <div class="detail-value">${ticketLot.name}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Preço:</div>
          <div class="detail-value">R$ ${price.toFixed(2)}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Código do Ingresso:</div>
          <div class="detail-value" style="font-family: monospace; font-size: 16px;">${code}</div>
        </div>
      </div>
      
      <div class="ticket-details" style="margin-top: 20px;">
  <h3>Informações do Evento</h3>
  <div class="detail-row">
    <div class="detail-label">Nome do Evento:</div>
    <div class="detail-value">${event.name}</div>
  </div>
  <div class="detail-row">
    <div class="detail-label">Data:</div>
    <div class="detail-value">${formattedStartDate} - ${formattedEndDate}</div>
  </div>
  <div class="detail-row">
    <div class="detail-label">Local:</div>
    <div class="detail-value">${event.place || 'Local não informado'}</div>
  </div>
</div>
      
      <div class="footer">
        <p>Nos vemos no evento! 🎉</p>
        <p>Atenciosamente,<br />Equipe SporTickets</p>
      </div>
    </body>
    </html>
    `;

    const pdfBuffer = await generatePdf(pdfHtml);

    const pdfAttachment = {
      content: pdfBuffer.toString('base64'),
      mime_type: 'application/pdf',
      name: 'ingresso.pdf',
    };

    await this.sendMail(
      user.email,
      user.name,
      `Seu ingresso para ${event.name} foi confirmado!`,
      emailHtmlBody,
      [pdfAttachment],
    );
  }

  async sendTicketRefund(ticket: TicketWithRelations) {
    const {
      user,
      ticketLot,
      category,
      price,
      ticketLot: { ticketType },
    } = ticket;

    const event = ticketLot.ticketType.event;
    const formattedRefundDate = formatDate(new Date().toISOString());

    const htmlBody = `
  <div>
    <h2 style="
      color:${this.brandColors.secondary};
      font-size:24px;margin-bottom:5px;text-align:center;">
      Estorno Realizado
    </h2>
    <h3 style="
      color:${this.brandColors.primary};
      font-size:20px;margin-top:0;margin-bottom:25px;text-align:center;">
      ${event.name}
    </h3>

    <p style="font-size:16px;line-height:1.6;margin-bottom:20px;">
      Olá <strong>${user.name}</strong>,
    </p>

    <p style="
      font-size:16px;line-height:1.6;margin-bottom:25px;
      background-color:#fdf7f7;padding:15px;border-radius:6px;
      border-left:4px solid ${this.brandColors.accent};">
      Informamos que o valor do ingresso abaixo foi <strong>reembolsado com sucesso</strong>.
    </p>

    <div style="
      background-color:#f8f9fa;border-radius:8px;padding:20px;
      margin-bottom:25px;box-shadow:0 2px 5px rgba(0,0,0,0.05);">
      <h3 style="
        color:${this.brandColors.secondary};font-size:18px;margin-top:0;
        margin-bottom:15px;border-bottom:2px solid ${this.brandColors.primary};
        padding-bottom:8px;">
        Dados do Estorno
      </h3>

      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;width:40%;color:#666;">Valor estornado:</td>
          <td style="padding:8px 0;font-weight:500;">R$ ${price.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;width:40%;color:#666;">Data do estorno:</td>
          <td style="padding:8px 0;font-weight:500;">${formattedRefundDate}</td>
        </tr>
      </table>
    </div>

    <div style="margin:25px 0;">
      <h3 style="
        color:${this.brandColors.secondary};font-size:18px;margin-top:0;
        margin-bottom:12px;border-bottom:2px solid ${this.brandColors.primary};
        padding-bottom:8px;">
        Ingresso Estornado
      </h3>
      <ul style="padding-left:20px;margin:0;">
        <li style="margin-bottom:6px;">
          <strong>${ticketType.name}</strong> — 
          Categoria: <strong>${category?.title ?? 'Sem categoria'}</strong> — 
          Código: <span style="font-family:monospace;">${ticket.code}</span>
        </li>
      </ul>
    </div>

    <p style="font-size:14px;line-height:1.6;color:#666;margin-top:30px;">
      O valor pode levar até <strong>7 dias úteis</strong> para aparecer em sua fatura ou extrato,
      dependendo da instituição financeira.
    </p>

    <div style="
      margin-top:30px;text-align:center;padding:15px;
      background:linear-gradient(90deg,
      ${this.brandColors.primary}22 0%,${this.brandColors.secondary}22 100%);
      border-radius:8px;">
      <p style="
        font-size:18px;font-weight:bold;margin:0;
        color:${this.brandColors.secondary};">
        Sentiremos sua falta, mas esperamos vê-lo(a) em breve! 🙌
      </p>
    </div>

    <div style="
      margin-top:30px;padding-top:20px;border-top:1px solid #eee;text-align:center;">
      <p style="font-size:14px;margin:0;">Atenciosamente,</p>
      <p style="
        font-size:16px;font-weight:bold;margin:5px 0 0;
        color:${this.brandColors.secondary};">
        Equipe SporTickets
      </p>
    </div>
  </div>
  `;

    return this.sendMail(
      user.email,
      user.name,
      `Estorno do ingresso – ${event.name}`,
      htmlBody,
    );
  }
}
