import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend = new Resend(process.env.RESEND_API_KEY);

  async sendPasswordResetEmail(to: string, link: string) {
    const { data, error } = await this.resend.emails.send({
      from: `Cherry 🍒 <${process.env.EMAIL_FROM}>`,
      to: [to],
      subject: 'Recuperación de contraseña',
      html: `
        <h2>Recuperar contraseña</h2>
        <p>Haz clic en el siguiente enlace:</p>
        <a href="${link}">Restablecer contraseña</a>
        <p>Este enlace expira en 15 minutos.</p>
      `,
    });

    if (error) {
      console.error(error);
      throw new Error('Error sending Email');
    }

    return data;
  }

  async sendVerificationEmail(to: string, link: string) {
    const { error } = await this.resend.emails.send({
      from: `Cherry 🍒 <${process.env.EMAIL_FROM}>`,
      to: [to],
      subject: 'Verifica tu cuenta',
      html: `
      <h2>Bienvenido a Cherry 🍒</h2>
      <p>Confirma tu cuenta haciendo clic:</p>
      <a href="${link}">Verificar email</a>
      <p>Este enlace expira en 1 hora.</p>
    `,
    });

    if (error) {
      console.error(error);
      throw new Error('Error sending email');
    }
  }
}
