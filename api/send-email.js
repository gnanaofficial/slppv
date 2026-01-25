import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { to, subject, html, attachments } = req.body;

        // Default sender - in production user should verify their domain
        const from = 'Sri Prasanna Venkateswara Swamy Temple <trust@slppvtempletpt.org>';

        const data = await resend.emails.send({
            from,
            to,
            subject,
            html,
            attachments
        });

        return res.status(200).json(data);
    } catch (error) {
        console.error('Email error:', error);
        return res.status(500).json({ error: error.message });
    }
}
