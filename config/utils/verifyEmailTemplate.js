const verifyEmailTemplate = (username, otp) => {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f0f2f5;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        padding: 30px 40px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      .header {
        text-align: center;
        border-bottom: 1px solid #e0e0e0;
        padding-bottom: 20px;
        margin-bottom: 20px;
      }
      .header h1 {
        font-size: 24px;
        color: #4CAF50;
        margin: 0;
      }
      .content p {
        font-size: 16px;
        line-height: 1.6;
      }
      .otp {
        display: inline-block;
        font-size: 24px;
        font-weight: bold;
        color: #ffffff;
        background-color: #4CAF50;
        padding: 12px 24px;
        border-radius: 6px;
        margin: 20px 0;
        letter-spacing: 2px;
      }
      .footer {
        text-align: center;
        font-size: 14px;
        color: #888;
        margin-top: 30px;
        border-top: 1px solid #e0e0e0;
        padding-top: 15px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Hello, ${username}!</h1>
        <p>Please verify your email address</p>
      </div>
      <div class="content">
        <p>Thanks for signing up with <strong>Haramain Khushbo</strong>. To complete your registration, please verify your email using the OTP below:</p>
        <div class="otp">${otp}</div>
        <p>If you didn't request this, you can safely ignore this email.</p>
      </div>
      <div class="footer">
        <p>&copy; 2025 Haramain Khushbo. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>`;
};

export default verifyEmailTemplate;
