import { Resend } from 'resend';

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { apiKey, from, to, subject, html } = req.body;

        // Validate required fields
        if (!apiKey || !from || !to || !subject || !html) {
            return res.status(400).json({
                error: 'Missing required fields: apiKey, from, to, subject, html'
            });
        }

        // Initialize Resend with the provided API key
        const resend = new Resend(apiKey);

        // Send email
        const data = await resend.emails.send({
            from,
            to,
            subject,
            html,
        });

        console.log('Email sent successfully:', data);

        return res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error('Error sending email:', error);

        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to send email',
            details: error
        });
    }
}
