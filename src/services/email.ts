import nodemailer from 'nodemailer';
import { SmtpSettings } from '@/types/settings';
import { ApiKey } from '@/types/api-key';

export interface EmailService {
  sendExpirationNotification: (to: string, apiKey: ApiKey, daysUntilExpiration: number) => Promise<void>;
}

export class SmtpEmailService implements EmailService {
  private transporter: nodemailer.Transporter;
  private fromEmail: string;

  constructor(settings: SmtpSettings) {
    this.transporter = nodemailer.createTransport({
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
      auth: {
        user: settings.username,
        pass: settings.password,
      },
    });
    this.fromEmail = settings.fromEmail;
  }

  async sendExpirationNotification(to: string, apiKey: ApiKey, daysUntilExpiration: number): Promise<void> {
    const subject = `API Key "${apiKey.name}" Expiring Soon`;
    const html = `
      <h2>API Key Expiration Notice</h2>
      <p>Your API key "${apiKey.name}" will expire in ${daysUntilExpiration} days.</p>
      <p><strong>Key Details:</strong></p>
      <ul>
        <li>Name: ${apiKey.name}</li>
        <li>Provider: ${apiKey.providerName}</li>
        <li>Expiration Date: ${apiKey.expiresAt?.toDate().toLocaleDateString()}</li>
      </ul>
      <p>Please create a new API key before the expiration date to ensure uninterrupted service.</p>
    `;

    await this.transporter.sendMail({
      from: this.fromEmail,
      to,
      subject,
      html,
    });
  }
}

let emailService: EmailService | null = null;

export const initializeEmailService = (settings: SmtpSettings) => {
  emailService = new SmtpEmailService(settings);
};

export const getEmailService = (): EmailService | null => {
  return emailService;
};
