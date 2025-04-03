declare module 'zeptomail' {
  export class SendMailClient {
    constructor(config: { url: string; token: string });

    sendMail(mailOptions: {
      from: { address: string; name?: string };
      to: { email_address: { address: string; name?: string } }[];
      reply_to?: { address: string; name?: string }[];
      subject: string;
      textbody?: string;
      htmlbody: string;
      cc?: { email_address: { address: string; name?: string } }[];
      bcc?: { email_address: { address: string; name?: string } }[];
      track_clicks?: boolean;
      track_opens?: boolean;
      client_reference?: string;
      mime_headers?: { [key: string]: string };
      attachments?: Array<{
        content?: string; // Base64 encoded content
        file_cache_key?: string;
        mime_type?: string; // e.g. 'image/png', 'image/jpg'
        name: string;
        content_id?: string; // For inline images
        disposition?: 'inline' | 'attachment';
      }>;
      inline_images?: Array<{
        content?: string; // Base64 encoded content
        file_cache_key?: string;
        mime_type?: string;
        cid: string; // Content-ID to reference in HTML
      }>;
    }): Promise<{ data: any; status: number }>;

    sendMailWithTemplate(mailOptions: {
      template_key: string;
      template_alias: string;
      from: { address: string; name?: string };
      to: { email_address: { address: string; name?: string } }[];
      reply_to?: { address: string; name?: string }[];
      cc?: { email_address: { address: string; name?: string } }[];
      bcc?: { email_address: { address: string; name?: string } }[];
      merge_info?: { [key: string]: any };
      client_reference?: string;
      mime_headers?: { [key: string]: string };
    }): Promise<{ data: any; status: number }>;

    sendBatchMail(mailOptions: {
      from: { address: string; name?: string };
      to: Array<{
        email_address: { address: string; name?: string };
        merge_info?: { [key: string]: any };
      }>;
      reply_to?: { address: string; name?: string }[];
      subject: string;
      textbody: string;
      htmlbody: string;
      cc?: { email_address: { address: string; name?: string } }[];
      bcc?: { email_address: { address: string; name?: string } }[];
      track_clicks?: boolean;
      track_opens?: boolean;
      client_reference?: string;
      mime_headers?: { [key: string]: string };
      attachments?: Array<{
        content?: string;
        file_cache_key?: string;
        mime_type?: string;
        name: string;
        content_id?: string;
        disposition?: 'inline' | 'attachment';
      }>;
      inline_images?: Array<{
        content?: string;
        file_cache_key?: string;
        mime_type?: string;
        cid: string;
      }>;
    }): Promise<{ data: any; status: number }>;

    mailBatchWithTemplate(mailOptions: {
      template_key: string;
      template_alias: string;
      from: { address: string; name?: string };
      to: Array<{
        email_address: { address: string; name?: string };
        merge_info?: { [key: string]: any };
      }>;
      reply_to?: { address: string; name?: string }[];
      client_reference?: string;
      mime_headers?: { [key: string]: string };
    }): Promise<{ data: any; status: number }>;
  }
}
