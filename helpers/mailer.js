import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendWelcomeEmailToTeam = async (to, name = "new team member") => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; background: #f9f9f9;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
        <h2 style="color: #4CAF50; margin-top: 0;">👋 Welcome to the CacheLabs Team, ${name}!</h2>
        <p>We're hyped to have you onboard. Get ready to build, ship, and break production (just kidding... maybe). 🤓</p>

        <p>Your journey at <strong>CacheLabs</strong> starts now. To access your dashboard, hit that juicy button below.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href=${process.env.FRONTEND_URL_INTERNAL_PROD} target="_blank" style="padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            🔐 Login to Your Account
          </a>
        </div>

        <p>If you have any questions, just scream into the void (or reply to this email).</p>

        <p style="color: #888; font-size: 12px;">– CacheLabs People Ops</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"CacheLabs" <${process.env.EMAIL_USERNAME}>`,
      to,
      subject: "👋 Welcome to CacheLabs!",
      html: htmlContent,
    });

    console.log(`✅ Welcome email sent to ${to}`);
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
  }
};


export const sendVerificationEmail = async (to, verificationToken) => {
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to,
    subject: "Verify Your Email Address",
    html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
              }
              .container {
                max-width: 600px;
                margin: 40px auto;
                padding: 20px;
                background: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
              .logo-text {
                text-align: center;
                margin-bottom: 30px;
                padding: 20px 0;
              }
              .logo-text span {
                font-size: 32px;
                font-weight: 700;
                color: #4f46e5;
                letter-spacing: 1px;
                text-transform: uppercase;
              }
              .header {
                text-align: center;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
              }
              h1 {
                color: #2d3748;
                font-size: 24px;
                margin: 0;
                margin-bottom: 10px;
              }
              .content {
                padding: 30px 20px;
                text-align: center;
              }
              p {
                color: #4a5568;
                font-size: 16px;
                margin: 0;
                margin-bottom: 20px;
              }
              .verification-button {
                display: inline-block;
                padding: 12px 30px;
                background-color: #4f46e5;
                color: #ffffff !important;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                margin: 20px 0;
                transition: background-color 0.3s ease;
              }
              .verification-button:hover {
                background-color: #4338ca;
              }
              .footer {
                text-align: center;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
                margin-top: 20px;
              }
              .footer p {
                font-size: 14px;
                color: #718096;
              }
              .expires-text {
                font-size: 14px;
                color: #718096;
                font-style: italic;
              }
              .secondary-text {
                color: #6b7280;
                font-size: 14px;
                font-weight: 500;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo-text">
                <span>PROXIMITY</span>
                <div class="secondary-text">Account Verification</div>
              </div>
              <div class="header">
                <h1>Verify Your Email Address</h1>
              </div>
              <div class="content">
                <p>Thank you for signing up! Please verify your email address to complete your registration.</p>
                
                <a href="${process.env.FRONTEND_URL
      }/verify/${verificationToken}" class="verification-button">
                  Verify Email Address
                </a>
                
                <p class="expires-text">This verification link expires in 24 hours.</p>
                
                <p>If you didn't create an account, you can safely ignore this email.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Proximity. All rights reserved.</p>
                <p>This is an automated message, please do not reply to this email.</p>
              </div>
            </div>
          </body>
          </html>
        `,
  };

  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error(error.message)
  }
};



export const sendPasswordResetEmail = async (to, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to,
    subject: "Password Reset OTP",
    html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset OTP</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
              }
              .container {
                max-width: 600px;
                margin: 40px auto;
                padding: 20px;
                background: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
              .logo-text {
                text-align: center;
                margin-bottom: 30px;
                padding: 20px 0;
              }
              .logo-text span {
                font-size: 32px;
                font-weight: 700;
                color: #4f46e5;
                letter-spacing: 1px;
                text-transform: uppercase;
              }
              .header {
                text-align: center;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
              }
              h1 {
                color: #2d3748;
                font-size: 24px;
                margin: 0;
                margin-bottom: 10px;
              }
              .content {
                padding: 30px 20px;
                text-align: center;
              }
              p {
                color: #4a5568;
                font-size: 16px;
                margin: 0;
                margin-bottom: 20px;
              }
              .otp-button {
                display: inline-block;
                padding: 12px 30px;
                background-color: #4f46e5;
                color: #ffffff !important;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                margin: 20px 0;
                transition: background-color 0.3s ease;
              }
              .otp-button:hover {
                background-color: #4338ca;
              }
              .footer {
                text-align: center;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
                margin-top: 20px;
              }
              .footer p {
                font-size: 14px;
                color: #718096;
              }
              .expires-text {
                font-size: 14px;
                color: #718096;
                font-style: italic;
              }
              .secondary-text {
                color: #6b7280;
                font-size: 14px;
                font-weight: 500;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo-text">
                <span>PROXIMITY</span>
                <div class="secondary-text">Password Reset</div>
              </div>
              <div class="header">
                <h1>Password Reset OTP</h1>
              </div>
              <div class="content">
                <p>We received a request to reset your password. Use the OTP below to reset your password.</p>
                
                <div style="font-size: 24px; font-weight: 700; color: #4f46e5; margin: 20px 0;">
                  ${otp}
                </div>
                
                <p class="expires-text">This OTP expires in 15 minutes.</p>
                
                <p>If you didn't request this change, please ignore this email.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Proximity. All rights reserved.</p>
                <p>This is an automated message, please do not reply to this email.</p>
              </div>
            </div>
          </body>
          </html>
        `,
  };

  return await transporter.sendMail(mailOptions);
};

export const sendTopicVerifySuccessfully = async (to, topic) => {
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to,
    subject: "Topic Verified Successfully",
    html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Topic Verification</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
              }
              .container {
                max-width: 600px;
                margin: 40px auto;
                padding: 20px;
                background: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
              .logo-text {
                text-align: center;
                margin-bottom: 30px;
                padding: 20px 0;
              }
              .logo-text span {
                font-size: 32px;
                font-weight: 700;
                color: #4f46e5;
                letter-spacing: 1px;
                text-transform: uppercase;
              }
              .header {
                text-align: center;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
              }
              h1 {
                color: #2d3748;
                font-size: 24px;
                margin: 0;
                margin-bottom: 10px;
              }
              .content {
                padding: 30px 20px;
                text-align: center;
              }
              p {
                color: #4a5568;
                font-size: 16px;
                margin: 0;
                margin-bottom: 20px;
              }
              .success-message {
                font-size: 18px;
                font-weight: bold;
                color: #38a169;
                margin-bottom: 20px;
              }
              .footer {
                text-align: center;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
                margin-top: 20px;
              }
              .footer p {
                font-size: 14px;
                color: #718096;
              }
              .secondary-text {
                color: #6b7280;
                font-size: 14px;
                font-weight: 500;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo-text">
                <span>PROXIMITY</span>
                <div class="secondary-text">Topic Verification</div>
              </div>
              <div class="header">
                <h1>Topic Verified Successfully!</h1>
              </div>
              <div class="content">
                <p class="success-message">Your topic <strong>${topic}</strong> has been successfully verified.</p>
                <p>You can now proceed with your next steps.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Proximity. All rights reserved.</p>
                <p>This is an automated message, please do not reply to this email.</p>
              </div>
            </div>
          </body>
          </html>
        `,
  };
  return await transporter.sendMail(mailOptions);
};

export const sendArticleVerifySuccesfullly = async (to, link) => {
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to,
    subject: "Article Verified Successfully",
    html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Topic Verification</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
              }
              .container {
                max-width: 600px;
                margin: 40px auto;
                padding: 20px;
                background: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
              .logo-text {
                text-align: center;
                margin-bottom: 30px;
                padding: 20px 0;
              }
              .logo-text span {
                font-size: 32px;
                font-weight: 700;
                color: #4f46e5;
                letter-spacing: 1px;
                text-transform: uppercase;
              }
              .header {
                text-align: center;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
              }
              h1 {
                color: #2d3748;
                font-size: 24px;
                margin: 0;
                margin-bottom: 10px;
              }
              .content {
                padding: 30px 20px;
                text-align: center;
              }
              p {
                color: #4a5568;
                font-size: 16px;
                margin: 0;
                margin-bottom: 20px;
              }
              .success-message {
                font-size: 18px;
                font-weight: bold;
                color: #38a169;
                margin-bottom: 20px;
              }
              .button {
                display: inline-block;
                background-color:rgb(203, 202, 226);
                color: white;
                text-decoration: none;
                font-size: 16px;
                font-weight: bold;
                padding: 12px 24px;
                border-radius: 6px;
                transition: background 0.3s;
              }
              .button:hover {
                background-color:rgb(165, 162, 190);
              }
              .footer {
                text-align: center;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
                margin-top: 20px;
              }
              .footer p {
                font-size: 14px;
                color: #718096;
              }
              .secondary-text {
                color: #6b7280;
                font-size: 14px;
                font-weight: 500;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo-text">
                <span>PROXIMITY</span>
                <div class="secondary-text">Article Verification</div>
              </div>
              <div class="header">
                <h1>Article Verified Successfully!</h1>
              </div>
              <div class="content">
                <p class="success-message">Your article has been successfully verified.</p>
                <p>You can now proceed with your next steps.</p>
                <a href="${link}" class="button">View Article</a>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Proximity. All rights reserved.</p>
                <p>This is an automated message, please do not reply to this email.</p>
              </div>
            </div>
          </body>
          </html>
        `,
  };
  return await transporter.sendMail(mailOptions);
};

