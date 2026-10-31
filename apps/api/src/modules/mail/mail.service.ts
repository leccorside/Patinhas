import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    const host = process.env.SMTP_HOST || 'mailpit';
    const port = Number(process.env.SMTP_PORT) || 1025;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
      ignoreTLS: true,
    });

    this.logger.log(`Serviço de e-mail inicializado via SMTP: ${host}:${port}`);
  }

  async sendVerificationEmail(to: string, name: string, token: string) {
    const verificationUrl = `${process.env.CORS_ORIGIN || 'http://localhost:3005'}/verify-email?token=${token}`;
    const subject = '🐾 Bem-vindo ao Patinhas! Confirme seu e-mail';

    const html = `
      <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 500px; margin: 0 auto; background-color: #FAFAF8; padding: 24px; border-radius: 24px; color: #263238;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #FF7043; margin: 0; font-size: 24px;">🐾 Patinhas</h1>
          <p style="color: #78909C; font-size: 13px; margin-top: 4px;">Adoção Responsável de Animais</p>
        </div>

        <div style="background-color: #FFFFFF; padding: 24px; border-radius: 16px; box-shadow: 0 4px 16px rgba(38, 50, 56, 0.05);">
          <h2 style="font-size: 18px; margin-top: 0; color: #263238;">Olá, ${name}!</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #59413A;">
            Ficamos muito felizes com o seu cadastro na nossa plataforma de adoção responsável.
          </p>
          <p style="font-size: 14px; line-height: 1.6; color: #59413A;">
            Para ativar sua conta e começar a favoritar ou adotar animais, confirme seu e-mail no botão abaixo:
          </p>

          <div style="text-align: center; margin: 28px 0;">
            <a href="${verificationUrl}" style="background: linear-gradient(135deg, #FF8A65 0%, #FF7043 100%); color: #FFFFFF; text-decoration: none; padding: 14px 28px; border-radius: 9999px; font-weight: bold; font-size: 14px; display: inline-block;">
              Confirmar Meu E-mail
            </a>
          </div>

          <p style="font-size: 12px; color: #78909C; margin-bottom: 0;">
            Se você não criou uma conta no Patinhas, pode desconsiderar esta mensagem.
          </p>
        </div>

        <div style="text-align: center; margin-top: 20px; font-size: 11px; color: #78909C;">
          Patinhas Plataforma de Adoção • São Paulo, SP
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Patinhas Adoção" <contato@patinhas.org>',
        to,
        subject,
        html,
      });
      this.logger.log(`E-mail de verificação enviado para ${to}`);
    } catch (error) {
      this.logger.error(`Erro ao enviar e-mail de verificação para ${to}:`, error);
    }
  }

  async sendPasswordResetEmail(to: string, name: string, token: string) {
    const resetUrl = `${process.env.CORS_ORIGIN || 'http://localhost:3005'}/reset-password?token=${token}`;
    const subject = '🔐 Patinhas: Recuperação de Senha';

    const html = `
      <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 500px; margin: 0 auto; background-color: #FAFAF8; padding: 24px; border-radius: 24px; color: #263238;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #FF7043; margin: 0; font-size: 24px;">🐾 Patinhas</h1>
          <p style="color: #78909C; font-size: 13px; margin-top: 4px;">Recuperação de Acesso</p>
        </div>

        <div style="background-color: #FFFFFF; padding: 24px; border-radius: 16px; box-shadow: 0 4px 16px rgba(38, 50, 56, 0.05);">
          <h2 style="font-size: 18px; margin-top: 0; color: #263238;">Olá, ${name}!</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #59413A;">
            Recebemos uma solicitação para redefinir a sua senha de acesso ao Patinhas.
          </p>

          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #FF8A65 0%, #FF7043 100%); color: #FFFFFF; text-decoration: none; padding: 14px 28px; border-radius: 9999px; font-weight: bold; font-size: 14px; display: inline-block;">
              Redefinir Minha Senha
            </a>
          </div>

          <p style="font-size: 12px; color: #78909C; margin-bottom: 0;">
            Este link expira em 1 hora. Se você não solicitou a alteração, sua conta continua segura.
          </p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Patinhas Adoção" <contato@patinhas.org>',
        to,
        subject,
        html,
      });
      this.logger.log(`E-mail de recuperação de senha enviado para ${to}`);
    } catch (error) {
      this.logger.error(`Erro ao enviar e-mail de recuperação para ${to}:`, error);
    }
  }
}

