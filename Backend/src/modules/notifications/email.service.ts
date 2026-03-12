import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: this.config.get<number>('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
    });
  }

  private async send(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: this.config.get<string>('EMAIL_FROM', 'SafeBuy <noreply@safebuy.com>'),
        to,
        subject,
        html,
      });
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
    }
  }

  async sendVerificationEmail(email: string, name: string, token: string) {
    const url = `${this.config.get('FRONTEND_URL')}/auth/verify-email?token=${token}`;
    await this.send(
      email,
      'SafeBuy — Verify Your Email',
      `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
        <div style="background:#f97316;padding:20px;text-align:center">
          <h1 style="color:white;margin:0">SafeBuy</h1>
        </div>
        <div style="padding:30px">
          <h2>Hi ${name}! 👋</h2>
          <p>Thank you for registering on SafeBuy. Please verify your email address to get started.</p>
          <a href="${url}" style="background:#f97316;color:white;padding:12px 30px;text-decoration:none;border-radius:5px;display:inline-block;margin:20px 0">
            ✅ Verify Email
          </a>
          <p style="color:#666;font-size:12px">This link expires in 24 hours. If you didn't register, ignore this email.</p>
        </div>
      </div>`,
    );
  }

  async sendPasswordResetEmail(email: string, name: string, token: string) {
    const url = `${this.config.get('FRONTEND_URL')}/auth/reset-password?token=${token}`;
    await this.send(
      email,
      'SafeBuy — Reset Your Password',
      `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
        <div style="background:#f97316;padding:20px;text-align:center">
          <h1 style="color:white;margin:0">SafeBuy</h1>
        </div>
        <div style="padding:30px">
          <h2>Hi ${name},</h2>
          <p>You requested a password reset. Click below to reset your password.</p>
          <a href="${url}" style="background:#f97316;color:white;padding:12px 30px;text-decoration:none;border-radius:5px;display:inline-block;margin:20px 0">
            🔑 Reset Password
          </a>
          <p style="color:#666;font-size:12px">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        </div>
      </div>`,
    );
  }

  async sendOrderConfirmation(email: string, name: string, orderNumber: string, total: number) {
    await this.send(
      email,
      `SafeBuy — Order Confirmed #${orderNumber}`,
      `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
        <div style="background:#f97316;padding:20px;text-align:center">
          <h1 style="color:white;margin:0">SafeBuy</h1>
        </div>
        <div style="padding:30px">
          <h2>Hi ${name}, your order is confirmed! 🎉</h2>
          <p>Order Number: <strong>#${orderNumber}</strong></p>
          <p>Total: <strong>৳${total}</strong></p>
          <p>We will notify you once your order is shipped.</p>
          <a href="${this.config.get('FRONTEND_URL')}/orders" 
             style="background:#f97316;color:white;padding:12px 30px;text-decoration:none;border-radius:5px;display:inline-block;margin:20px 0">
            📦 Track Your Order
          </a>
        </div>
      </div>`,
    );
  }
}
