import { google } from "googleapis";
import config from "../config/config.js";

const oauth2Client = new google.auth.OAuth2(
  config.GOOGLE_CLIENT_ID,
  config.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
  refresh_token: config.GOOGLE_REFRESH_TOKEN,
});

const buildRawEmail = (to, subject, html, text) => {
  const boundary = "boundary_" + Date.now();
  const lines = [
    `From: "Auth Application" <${config.GOOGLE_USER}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    ``,
    text || "",
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    ``,
    html || "",
    ``,
    `--${boundary}--`,
  ];

  return Buffer.from(lines.join("\r\n"))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

export const sendEmail = async (to, subject, text, html) => {
  try {
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const raw = buildRawEmail(to, subject, html, text);

    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });

    console.log("Message sent:", response.data.id);
  } catch (error) {
    console.error("Email sending failed:", error.message);
    throw error;
  }
};