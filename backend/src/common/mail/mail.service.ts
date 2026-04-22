import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  async sendOtp(email: string, subject: string, code: string) {
    await this.transporter.sendMail({
      from: `"Print Aja" <${process.env.MAIL_USER}>`,
      to: email,
      subject: subject,
      html: `<!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8" />
                <title>${subject}</title>
              </head>
                <body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, sans-serif;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff; margin-top:40px; border-radius:8px; padding:30px;">
            
                          <!-- Header -->
                          <tr>
                            <td align="center">
                              <h2 style="margin:0; color:#333;">${subject}</h2>
                            </td>
                          </tr>

                          <!-- Content -->
                          <tr>
                            <td style="padding-top:20px; color:#555; text-align:center;">
                              <p>Your OTP code is:</p>
                            </td>
                          </tr>

                          <!-- OTP -->
                          <tr>
                            <td align="center" style="padding:20px 0;">
                              <div style="
                                font-size:32px;
                                letter-spacing:8px;
                                font-weight:bold;
                                color:#000;
                                background:#f2f2f2;
                                padding:15px 25px;
                                border-radius:6px;
                                display:inline-block;
                              ">
                              ${code}
                              </div>
                            </td>
                          </tr>

                          <!-- Info -->
                          <tr>
                            <td style="text-align:center; color:#777;">
                              <p>This code will expire in <b>10 minutes</b>.</p>
                              <p>If you didn't request this, please ignore this email.</p>
                            </td>
                          </tr>

                          <!-- Footer -->
                          <tr>
                            <td style="padding-top:30px; text-align:center; color:#aaa; font-size:12px;">
                              <p>&copy; ${new Date().getFullYear()} Your App. All rights reserved.</p>
                            </td>
                          </tr>

                      </table>
                    </td>
                  </tr>
                </table>
              </body>
            </html>`,
    });
  }
}
