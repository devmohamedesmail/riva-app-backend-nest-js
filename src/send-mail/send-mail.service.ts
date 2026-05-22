import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
@Injectable()
export class SendMailService {
    private transporter =
    nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,

      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

  async sendMail(
    to: string,
    subject: string,
    html: string,
  ) {
    return this.transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      html,
    });
  }

  async sendOrderEmail(data: any) {
    await this.sendMail(
      'dev.mohamed.esmail@gmail.com',
      'New Order',
      `<h1>New Order</h1>`,
    );
  }
}
