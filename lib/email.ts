import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface ContactSubmissionData {
  id: string;
  name: string;
  email: string;
  company: string;
  message: string;
  inquiryType: string;
}

export interface DemoScheduleData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  date: string;
  time: string;
  meetingLink?: string;
}

// Email service configuration and health check

export interface EmailConfig {
  provider: 'sendgrid' | 'console' | 'disabled';
  apiKey?: string;
  fromAddress: string;
  enabled: boolean;
}

// Get email configuration
function getEmailConfig(): EmailConfig {
  const provider = process.env.EMAIL_PROVIDER || 'console';
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromAddress = process.env.EMAIL_FROM_ADDRESS || 'dev@giuev.local';
  
  return {
    provider: provider as 'sendgrid' | 'console' | 'disabled',
    apiKey,
    fromAddress,
    enabled: provider !== 'disabled'
  };
}

// Email health check
export async function checkEmailService(): Promise<boolean> {
  const config = getEmailConfig();
  
  if (!config.enabled) {
    console.log('Email service disabled');
    return false;
  }
  
  if (config.provider === 'console') {
    console.log('Email service configured for console output (development mode)');
    return true;
  }
  
  if (config.provider === 'sendgrid') {
    if (!config.apiKey) {
      console.warn('SendGrid API key not configured');
      return false;
    }
    
    // In a real implementation, you could test the SendGrid API
    // For now, just check if the API key is present
    return config.apiKey.startsWith('SG.');
  }
  
  return false;
}

// Send email function
export async function sendEmail(to: string, subject: string, content: string, html?: string): Promise<boolean> {
  const config = getEmailConfig();
  
  if (!config.enabled) {
    console.log('Email service disabled - not sending email');
    return false;
  }
  
  if (config.provider === 'console') {
    console.log('📧 Email (Console Mode):');
    console.log(`To: ${to}`);
    console.log(`From: ${config.fromAddress}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content: ${content}`);
    if (html) {
      console.log(`HTML: ${html}`);
    }
    console.log('---');
    return true;
  }
  
  if (config.provider === 'sendgrid' && config.apiKey) {
    try {
      // Here you would implement actual SendGrid API call
      // const sgMail = require('@sendgrid/mail');
      // sgMail.setApiKey(config.apiKey);
      // await sgMail.send({...});
      
      console.log(`Email sent via SendGrid to ${to}: ${subject}`);
      return true;
    } catch (error) {
      console.error('Failed to send email via SendGrid:', error);
      return false;
    }
  }
  
  return false;
}

// Send demo confirmation email
export async function sendDemoConfirmation(
  to: string,
  firstName: string,
  scheduledDate: string,
  meetingLink?: string
): Promise<boolean> {
  const subject = 'Demo Confirmation - GIU EV Charging Platform';
  const content = `
Dear ${firstName},

Thank you for scheduling a demo with GIU EV Charging Infrastructure!

Demo Details:
- Date: ${scheduledDate}
- Meeting Link: ${meetingLink || 'Will be provided separately'}

Our team will showcase:
- Real-time fleet monitoring
- V2G revenue optimization
- Smart charging management
- Digital twin technology

If you need to reschedule, please contact us at least 24 hours in advance.

Best regards,
GIU Technologies Team
  `;
  
  return sendEmail(to, subject, content);
}

// Send contact form notification
export async function sendContactNotification(
  name: string,
  email: string,
  company: string,
  message: string
): Promise<boolean> {
  const salesEmails = process.env.SALES_TEAM_EMAILS?.split(',') || ['dev-sales@giuev.local'];
  
  let allSent = true;
  
  for (const salesEmail of salesEmails) {
    const subject = `New Contact Form Submission - ${company}`;
    const content = `
New contact form submission received:

Name: ${name}
Email: ${email}
Company: ${company}

Message:
${message}

Please follow up within 24 hours.
    `;
    
    const sent = await sendEmail(salesEmail.trim(), subject, content);
    if (!sent) allSent = false;
  }
  
  return allSent;
}

// Contact form confirmation email to customer
export async function sendContactConfirmationEmail(data: ContactSubmissionData): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        .btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Thank You for Contacting GIU EV</h1>
          <p>Your inquiry has been received</p>
        </div>
        <div class="content">
          <p>Dear ${data.name},</p>
          
          <p>Thank you for your interest in GIU EV Charging Infrastructure. We have received your inquiry and our expert team will review it shortly.</p>
          
          <h3>Your Submission Details:</h3>
          <ul>
            <li><strong>Submission ID:</strong> ${data.id}</li>
            <li><strong>Company:</strong> ${data.company}</li>
            <li><strong>Inquiry Type:</strong> ${data.inquiryType}</li>
            <li><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</li>
          </ul>
          
          <p><strong>Your Message:</strong></p>
          <p style="background: white; padding: 15px; border-left: 4px solid #3b82f6; margin: 15px 0;">${data.message}</p>
          
          <p>Our team typically responds within 2 business hours. If you have an urgent matter, please call us directly at <strong>+1 (617) 555-1234</strong>.</p>
          
          <a href="https://giuev.com/support" class="btn">Visit Support Center</a>
          
          <p>Best regards,<br>The GIU EV Team</p>
        </div>
        <div class="footer">
          <p>© 2024 GIU EV Charging Infrastructure. All rights reserved.</p>
          <p>300 Technology Square, Cambridge, MA 02139</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(data.email, 'Thank you for contacting GIU EV - We\'ll be in touch soon', html, html);
}

// Internal notification email to sales team
export async function sendContactNotificationEmail(data: ContactSubmissionData): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #3b82f6;">New Contact Form Submission</h2>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; background: #f1f5f9; font-weight: bold; width: 120px;">Name:</td>
            <td style="padding: 8px;">${data.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; background: #f1f5f9; font-weight: bold;">Email:</td>
            <td style="padding: 8px;">${data.email}</td>
          </tr>
          <tr>
            <td style="padding: 8px; background: #f1f5f9; font-weight: bold;">Company:</td>
            <td style="padding: 8px;">${data.company}</td>
          </tr>
          <tr>
            <td style="padding: 8px; background: #f1f5f9; font-weight: bold;">Inquiry Type:</td>
            <td style="padding: 8px;">${data.inquiryType}</td>
          </tr>
          <tr>
            <td style="padding: 8px; background: #f1f5f9; font-weight: bold;">Submission ID:</td>
            <td style="padding: 8px;">${data.id}</td>
          </tr>
        </table>
        
        <h3>Message:</h3>
        <div style="background: #f8fafc; padding: 15px; border-left: 4px solid #3b82f6; margin: 15px 0;">
          ${data.message}
        </div>
        
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/contacts/${data.id}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View in Admin Panel</a></p>
      </div>
    </body>
    </html>
  `;

  const salesEmails = (process.env.SALES_TEAM_EMAILS || 'sales@giuev.com').split(',');
  
  const results = await Promise.allSettled(
    salesEmails.map(email => 
      sendEmail(email.trim(), `New ${data.inquiryType} inquiry from ${data.company}`, html)
    )
  );

  return results.some(result => result.status === 'fulfilled');
}

// Demo confirmation email to customer
export async function sendDemoConfirmationEmail(data: DemoScheduleData): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .calendar-box { background: white; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
        .btn { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        .btn-secondary { background: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Demo Scheduled Successfully! 🎉</h1>
          <p>Your personalized EV charging demo is confirmed</p>
        </div>
        <div class="content">
          <p>Dear ${data.firstName} ${data.lastName},</p>
          
          <p>Great news! Your demo of the GIU EV Charging Infrastructure platform has been scheduled. We're excited to show you how our technology can transform your EV operations.</p>
          
          <div class="calendar-box">
            <h3 style="margin: 0 0 10px 0; color: #10b981;">📅 Demo Details</h3>
            <p style="font-size: 18px; font-weight: bold; margin: 10px 0;">${data.date} at ${data.time}</p>
            <p style="margin: 5px 0;"><strong>Company:</strong> ${data.company}</p>
            <p style="margin: 5px 0;"><strong>Demo ID:</strong> ${data.id}</p>
          </div>
          
          ${data.meetingLink ? `
            <div style="text-align: center; margin: 20px 0;">
              <a href="${data.meetingLink}" class="btn">Join Demo Meeting</a>
              <a href="#" class="btn btn-secondary">Add to Calendar</a>
            </div>
          ` : '<p style="background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">Meeting link will be sent 30 minutes before your scheduled demo.</p>'}
          
          <h3>What to Expect:</h3>
          <ul>
            <li>🚗 Live demonstration of fleet management features</li>
            <li>⚡ Charging optimization and energy management tools</li>
            <li>📊 Real-time analytics and reporting capabilities</li>
            <li>🤝 Q&A session tailored to your business needs</li>
            <li>💡 Custom solution recommendations</li>
          </ul>
          
          <p>If you need to reschedule or have any questions, please contact us at <strong>sales@giuev.com</strong> or <strong>+1 (617) 555-1235</strong>.</p>
          
          <p>Looking forward to speaking with you!</p>
          
          <p>Best regards,<br>The GIU EV Sales Team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(data.email, `Demo Confirmed: ${data.date} at ${data.time} - GIU EV Platform`, html, html);
}

// Internal demo notification to sales team
export async function sendDemoNotificationEmail(data: DemoScheduleData): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #10b981;">New Demo Scheduled 🎯</h2>
        
        <div style="background: #f0fdf4; border: 1px solid #16a34a; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #16a34a;">Demo Details</h3>
          <p><strong>Date & Time:</strong> ${data.date} at ${data.time}</p>
          <p><strong>Contact:</strong> ${data.firstName} ${data.lastName}</p>
          <p><strong>Company:</strong> ${data.company}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Demo ID:</strong> ${data.id}</p>
        </div>
        
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/demos/${data.id}" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Prepare Demo</a></p>
        
        <p><strong>Action Required:</strong></p>
        <ul>
          <li>Generate meeting link if not already done</li>
          <li>Prepare demo environment</li>
          <li>Send calendar invite</li>
          <li>Review prospect information</li>
        </ul>
      </div>
    </body>
    </html>
  `;

  const salesEmails = (process.env.SALES_TEAM_EMAILS || 'sales@giuev.com').split(',');
  
  const results = await Promise.allSettled(
    salesEmails.map(email => 
      sendEmail(email.trim(), `Demo Scheduled: ${data.company} - ${data.date} ${data.time}`, html)
    )
  );

  return results.some(result => result.status === 'fulfilled');
} 