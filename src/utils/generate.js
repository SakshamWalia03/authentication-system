import config from "../config/config.js";
import jwt from "jsonwebtoken";

export const generateAccessToken = (userId, username) => {
  return jwt.sign(
    {
      id: userId,
      username,
    },
    config.JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );
};

export const generateRefreshToken = (userId, username) => {
  return jwt.sign(
    {
      id: userId,
      username,
    },
    config.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};


export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateHTMLTemplate = (otp) => {
  return `
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f5f7fa;
            padding: 40px 16px;
          }
          .card {
            max-width: 480px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            padding: 48px 40px;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
            text-align: center;
          }
          .icon {
            font-size: 40px;
            margin-bottom: 16px;
          }
          h1 {
            font-size: 24px;
            font-weight: 700;
            color: #1a1a2e;
            margin-bottom: 8px;
          }
          .subtitle {
            font-size: 15px;
            color: #6b7280;
            margin-bottom: 32px;
            line-height: 1.5;
          }
          .otp-box {
            display: inline-block;
            background: #f0f4ff;
            border: 2px dashed #a5b4fc;
            border-radius: 12px;
            padding: 20px 40px;
            margin-bottom: 24px;
          }
          .otp-code {
            font-size: 36px;
            font-weight: 800;
            letter-spacing: 10px;
            color: #4f46e5;
          }
          .expiry {
            font-size: 13px;
            color: #9ca3af;
            margin-bottom: 32px;
          }
          .expiry span {
            color: #f59e0b;
            font-weight: 600;
          }
          .divider {
            border: none;
            border-top: 1px solid #f3f4f6;
            margin-bottom: 24px;
          }
          .note {
            font-size: 13px;
            color: #9ca3af;
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">🔐</div>
          <h1>Here's your code!</h1>
          <p class="subtitle">Use the one-time code below to continue.<br />Please don't share it with anyone.</p>

          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>

          <p class="expiry">⏱ Expires in <span>5 minutes</span></p>

          <hr class="divider" />

          <p class="note">Didn't request this? You can safely ignore this email.<br />No changes will be made to your account.</p>
        </div>
      </body>
    </html>
  `;
};

export const generateEmailTextTemplate = (otp) => {
  return `
    Here's your one-time code: ${otp}
    This code will expire in 5 minutes.
  `;
};
