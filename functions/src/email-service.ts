import * as nodemailer from 'nodemailer'
import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

interface EmailConfig {
  to: string
  subject: string
  html: string
}

const getEmailTransport = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: functions.config().email.user,
      pass: functions.config().email.pass,
    },
  })
}

export const sendEmail = async (config: EmailConfig) => {
  const transport = getEmailTransport()
  
  try {
    await transport.sendMail({
      from: `"CyberKey Security" <${functions.config().email.user}>`,
      ...config,
    })
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

export const getSecurityAlertEmailTemplate = (alert: any) => {
  const activityList = alert.details.recentActivities
    .map(
      (activity: any) => `
      <li style="margin-bottom: 10px;">
        <strong>${activity.type}</strong><br>
        IP: ${activity.ipAddress || 'Unknown'}<br>
        Time: ${activity.timestamp}
      </li>
    `
    )
    .join('')

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
        <h1 style="color: #dc3545; margin-bottom: 20px;">Security Alert: ${alert.type}</h1>
        
        <p style="color: #343a40; font-size: 16px; line-height: 1.5;">
          We've detected suspicious activity on your CyberKey account. Please review the details below:
        </p>

        <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h2 style="color: #495057; font-size: 18px;">Activity Details</h2>
          <ul style="list-style: none; padding: 0;">
            ${activityList}
          </ul>
        </div>

        <p style="color: #6c757d; margin-top: 20px;">
          If you don't recognize this activity, please secure your account immediately by:
          <ol style="margin-top: 10px;">
            <li>Changing your password</li>
            <li>Reviewing your API keys</li>
            <li>Enabling two-factor authentication if not already enabled</li>
          </ol>
        </p>

        <div style="margin-top: 30px; text-align: center;">
          <a href="${functions.config().app.url}/security" 
             style="background-color: #0d6efd; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Security Dashboard
          </a>
        </div>
      </div>
    </div>
  `
}
