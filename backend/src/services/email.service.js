import { ENV } from '../config/env.js';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

export const sendVerificationEmail = async (toEmail, firstName, code) => {
    const response = await fetch(BREVO_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-key': ENV.BREVO_API_KEY,
        },
        body: JSON.stringify({
            sender: { name: 'SkipSmart', email: ENV.BREVO_SENDER_EMAIL },
            to: [{ email: toEmail, name: firstName }],
            subject: 'Verify your SkipSmart account',
            htmlContent: `<p>Hi ${firstName},</p><p>Your verification code is:</p><h2>${code}</h2><p>This code expires in 10 minutes.</p>`,
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Brevo email send failed: ${response.status} ${errorBody}`);
    }

    return true;
};
