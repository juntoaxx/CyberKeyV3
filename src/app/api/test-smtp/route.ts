import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import type { SmtpSettings } from '@/types/settings';

export async function POST(req: Request) {
  try {
    const { settings, to } = await req.json();

    if (!settings || !to) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
      auth: {
        user: settings.username,
        pass: settings.password,
      },
    });

    // Send test email
    await transporter.sendMail({
      from: settings.fromEmail,
      to: to,
      subject: 'CyberKey - Test Email',
      text: 'This is a test email from CyberKey to verify your SMTP settings.',
      html: `
        <h1>CyberKey - Test Email</h1>
        <p>This is a test email from CyberKey to verify your SMTP settings.</p>
        <p>If you received this email, your SMTP settings are configured correctly!</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send test email' },
      { status: 500 }
    );
  }
}
