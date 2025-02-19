declare module 'zeptomail' {
  export class SendMailClient {
    constructor(config: { url: string; token: string });

    sendMail(mailOptions: {
      from: { address: string; name?: string };
      to: { email_address: { address: string; name?: string } }[];
      subject: string;
      htmlbody: string;
    }): Promise<{ data: any; status: number }>;
  }
}
