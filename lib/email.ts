import nodemailer from "nodemailer";

// Read exact environment variables
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
const SMTP_USER = process.env.SMTP_USER || "jeel3749@gmail.com";
const SMTP_PASS = process.env.SMTP_PASS || "jtotslhfivsydsvu";
const SMTP_SECURE = process.env.SMTP_SECURE === "true"; // Parse boolean true/false
const EMAIL_FROM = process.env.EMAIL_FROM || "LOOP <jeel3749@gmail.com>";
const APP_NAME = process.env.APP_NAME || "LOOP";

/**
 * Creates and returns a verified Nodemailer SMTP transporter.
 * Verifies host, connection and authentication settings on startup.
 */
export async function getVerifiedTransporter() {
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    const errorMsg = "SMTP credentials missing from environment configuration.";
    console.error(`❌ [SMTP CONFIG ERROR] ${errorMsg}`);
    throw new Error("SMTP credentials are not configured in your environment.");
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false // Prevents local self-signed cert issues
    }
  });

  try {
    // Verify connection configuration
    console.log(`🔌 [SMTP DEBUG] Testing connection to ${SMTP_HOST}:${SMTP_PORT}...`);
    await transporter.verify();
    console.log("✅ [SMTP DEBUG] Connection and authentication verified successfully.");
    return transporter;
  } catch (error: any) {
    console.error(`❌ [SMTP DEBUG] Verification failed:`, error);
    if (error.code === "EAUTH") {
      throw new Error("Email configuration is incorrect."); // Auth failure
    } else {
      throw new Error("Unable to connect to email server."); // Conn failure
    }
  }
}

/**
 * Sends a production-grade Stripe/GitHub-style responsive HTML email containing the verification code.
 */
export async function sendOtpEmail(email: string, code: string, expiryMinutes = 5, workspaceName?: string) {
  const transporter = await getVerifiedTransporter();
  const subject = workspaceName 
    ? `Verify your email for ${workspaceName} | ${APP_NAME}` 
    : `Verify your email | ${APP_NAME}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your email | ${APP_NAME}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 520px;
            margin: 40px auto;
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          }
          .logo-container {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 30px;
          }
          .logo-text {
            font-size: 20px;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: -0.025em;
          }
          .logo-dot {
            height: 8px;
            width: 8px;
            border-radius: 50%;
            background-color: #2563eb;
          }
          .heading {
            font-size: 24px;
            font-weight: 700;
            color: #0f172a;
            margin-top: 0;
            margin-bottom: 16px;
            letter-spacing: -0.02em;
          }
          .text {
            font-size: 14px;
            line-height: 24px;
            color: #475569;
            margin-bottom: 24px;
          }
          .otp-container {
            background-color: #f1f5f9;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            margin-bottom: 24px;
            border: 1px solid #e2e8f0;
          }
          .otp-label {
            font-size: 10px;
            font-weight: 800;
            color: #64748b;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            margin-bottom: 8px;
            display: block;
          }
          .otp-code {
            font-size: 36px;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: 0.25em;
            font-family: 'SF Mono', SFMono-Regular, Consolas, 'Liberation Mono', Menlo, Courier, monospace;
          }
          .expiry-text {
            font-size: 12px;
            color: #64748b;
            text-align: center;
            margin-bottom: 30px;
          }
          .divider {
            border-top: 1px solid #e2e8f0;
            margin: 30px 0;
          }
          .footer-text {
            font-size: 12px;
            line-height: 20px;
            color: #94a3b8;
          }
          .security-msg {
            font-size: 11px;
            color: #94a3b8;
            margin-bottom: 8px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo-container">
            <span class="logo-text">${APP_NAME}</span>
            <span class="logo-dot"></span>
          </div>
          <h1 class="heading">Verify your email address</h1>
          <p class="text">
            Enter the following verification code to confirm your email and set up your active workspace dashboard.
          </p>
          <div class="otp-container">
            <span class="otp-label">Verification Code</span>
            <span class="otp-code">${code}</span>
          </div>
          <p class="expiry-text">
            This verification code is active for <strong>${expiryMinutes} minutes</strong>.
          </p>
          <div class="divider"></div>
          <p class="security-msg">
            🛡️ <strong>Security Warning:</strong> If you did not initiate this request, please ignore this email or contact support if you suspect unauthorized activity.
          </p>
          <p class="footer-text">
            Sent by ${APP_NAME} Operations Hub. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `;

  console.log(`✉️ [SMTP SEND] Attempting to deliver email to ${email}...`);
  const info = await transporter.sendMail({
    from: EMAIL_FROM,
    to: email,
    subject,
    html: htmlContent
  });
  console.log(`✅ [SMTP SEND] Delivered successfully. Message ID: ${info.messageId}`);
  return true;
}

export async function sendMagicLinkEmail(email: string, token: string, expiryMinutes = 15, workspaceName?: string) {
  const transporter = await getVerifiedTransporter();
  const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/magic-link/verify?token=${encodeURIComponent(token)}`;
  const subject = workspaceName
    ? `Verify your email for ${workspaceName} | ${APP_NAME}`
    : `Verify your email | ${APP_NAME}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Verify your email | ${APP_NAME}</title>
        <style>
          body {font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; -webkit-font-smoothing: antialiased;}
          .container {max-width: 520px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);}
          .logo-container {display: flex; align-items: center; gap: 10px; margin-bottom: 30px;}
          .logo-text {font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.025em;}
          .logo-dot {height: 8px; width: 8px; border-radius: 50%; background-color: #2563eb;}
          .heading {font-size: 24px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px; letter-spacing: -0.02em;}
          .text {font-size: 14px; line-height: 24px; color: #475569; margin-bottom: 24px;}
          .button {display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;}
          .footer-text {font-size: 12px; line-height: 20px; color: #94a3b8;}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo-container">
            <span class="logo-text">${APP_NAME}</span>
            <span class="logo-dot"></span>
          </div>
          <h1 class="heading">Verify your email address</h1>
          <p class="text">Click the button below to verify your email and complete your account setup.</p>
          <p style="text-align:center;margin:24px 0;">
            <a href="${verificationUrl}" class="button">Verify Email &amp; Create Account</a>
          </p>
          <p class="text">This verification link is active for <strong>${expiryMinutes} minutes</strong>.</p>
          <hr class="divider" style="border-top:1px solid #e2e8f0;margin:30px 0;"/>
          <p class="footer-text">Sent by ${APP_NAME} Operations Hub. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  console.log(`✉️ [SMTP SEND] Attempting to deliver magic link email to ${email}...`);
  const info = await transporter.sendMail({
    from: EMAIL_FROM,
    to: email,
    subject,
    html: htmlContent
  });
  console.log(`✅ [SMTP SEND] Magic link delivered. Message ID: ${info.messageId}`);
  return true;
}

export async function sendInvitationEmail(email: string, inviteUrl: string, workspaceName: string, role: string) {
  const transporter = await getVerifiedTransporter();
  const subject = `Invite to join ${workspaceName} on ${APP_NAME}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Accept Workspace Invitation | ${APP_NAME}</title>
        <style>
          body {font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; -webkit-font-smoothing: antialiased;}
          .container {max-width: 520px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);}
          .logo-container {display: flex; align-items: center; gap: 10px; margin-bottom: 30px;}
          .logo-text {font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.025em;}
          .logo-dot {height: 8px; width: 8px; border-radius: 50%; background-color: #2563eb;}
          .heading {font-size: 24px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px; letter-spacing: -0.02em;}
          .text {font-size: 14px; line-height: 24px; color: #475569; margin-bottom: 24px;}
          .button {display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;}
          .footer-text {font-size: 12px; line-height: 20px; color: #94a3b8;}
          .highlight {font-weight: 600; color: #0f172a;}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo-container">
            <span class="logo-text">${APP_NAME}</span>
            <span class="logo-dot"></span>
          </div>
          <h1 class="heading">You've been invited!</h1>
          <p class="text">
            You have been invited to join the workspace <span class="highlight">${workspaceName}</span> as <span class="highlight">${role}</span> on ${APP_NAME}.
          </p>
          <p style="text-align:center;margin:24px 0;">
            <a href="${inviteUrl}" class="button">Accept Invitation &amp; Create Account</a>
          </p>
          <p class="text">This invitation link is valid for 48 hours.</p>
          <hr class="divider" style="border-top:1px solid #e2e8f0;margin:30px 0;"/>
          <p class="footer-text">Sent by ${APP_NAME} Operations Hub. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  console.log(`✉️ [SMTP SEND] Attempting to deliver invitation email to ${email}...`);
  const info = await transporter.sendMail({
    from: EMAIL_FROM,
    to: email,
    subject,
    html: htmlContent
  });
  console.log(`✅ [SMTP SEND] Invitation delivered successfully. Message ID: ${info.messageId}`);
  return true;
}

export async function sendPasswordResetEmail(email: string, token: string, expiryMinutes = 15) {
  const transporter = await getVerifiedTransporter();
  const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${encodeURIComponent(token)}`;
  const subject = `Reset your password | ${APP_NAME}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Reset Password | ${APP_NAME}</title>
        <style>
          body {font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; -webkit-font-smoothing: antialiased;}
          .container {max-width: 520px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03);}
          .logo-container {display: flex; align-items: center; gap: 10px; margin-bottom: 30px;}
          .logo-text {font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.025em;}
          .logo-dot {height: 8px; width: 8px; border-radius: 50%; background-color: #2563eb;}
          .heading {font-size: 24px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px; letter-spacing: -0.02em;}
          .text {font-size: 14px; line-height: 24px; color: #475569; margin-bottom: 24px;}
          .button {display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;}
          .footer-text {font-size: 12px; line-height: 20px; color: #94a3b8;}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo-container">
            <span class="logo-text">${APP_NAME}</span>
            <span class="logo-dot"></span>
          </div>
          <h1 class="heading">Reset your password</h1>
          <p class="text">We received a request to reset your password. Click the button below to choose a new password.</p>
          <p style="text-align:center;margin:24px 0;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </p>
          <p class="text">This link is active for <strong>${expiryMinutes} minutes</strong>.</p>
          <hr class="divider" style="border-top:1px solid #e2e8f0;margin:30px 0;"/>
          <p class="footer-text">Sent by ${APP_NAME} Operations Hub. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  console.log(`✉️ [SMTP SEND] Attempting to deliver password reset email to ${email}...`);
  const info = await transporter.sendMail({
    from: EMAIL_FROM,
    to: email,
    subject,
    html: htmlContent
  });
  console.log(`✅ [SMTP SEND] Password reset email delivered successfully. Message ID: ${info.messageId}`);
  return true;
}
