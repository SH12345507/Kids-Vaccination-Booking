const nodemailer = require("nodemailer");

// ✅ Reuses the SMTP credentials from .env — works for Mailtrap (testing)
// or Gmail (real delivery). Port 465 requires secure:true, port 587 uses
// secure:false with STARTTLS — this picks the right one automatically.

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: Number(process.env.MAIL_PORT) === 465,
  family: 4, // Force IPv4 — Railway containers can't reach Gmail over IPv6
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// to      -> recipient email
// subject -> email subject line
// html    -> email body (HTML)
const sendEmail = async ({ to, subject, html }) => {
  const info = await transporter.sendMail({
    // ✅ Gmail (and most real providers) reject/flag mail where "from" isn't
    // the authenticated account, so we use MAIL_USER itself here.
    from: `"KVB Vaccination" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
  });

  // ✅ Gmail/nodemailer don't always throw when a recipient is refused —
  // sendMail can resolve successfully while still listing that address in
  // `rejected` instead of `accepted`. Without checking this, a failed send
  // looks identical to a successful one to the caller.
  if (info.rejected && info.rejected.length > 0) {
    throw new Error(`Email rejected by server for: ${info.rejected.join(", ")}`);
  }

  return info;
};

module.exports = sendEmail;