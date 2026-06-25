import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';


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

     const html = await ejs.renderFile(
        path.join(
            process.cwd(),
            'src',
            'views',
            'emails',
            'new-order.ejs',
        ),
        {
            orderGroup: data.orderGroup,
            orders: data.orders,
        },
    );
    await this.sendMail(
      'dev.mohamed.esmail@gmail.com',
      'New Order',
      html,
    );
  }
}
