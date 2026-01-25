import { getEmailConfig, getSiteSettings } from "../lib/configService";

/**
 * Send email via Vercel serverless function
 * This avoids CORS issues by calling Resend from the backend
 */
const sendEmailViaAPI = async (to, subject, html) => {
  try {
    const emailConfig = await getEmailConfig();

    if (!emailConfig.enabled) {
      throw new Error("Email notifications are disabled");
    }

    if (!emailConfig.resendApiKey) {
      throw new Error("Resend API key not configured");
    }

    // Call Vercel serverless function
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: emailConfig.resendApiKey,
        from: `${emailConfig.senderName} <${emailConfig.senderEmail}>`,
        to,
        subject,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send email');
    }

    return data;
  } catch (error) {
    console.error('Error in sendEmailViaAPI:', error);
    throw error;
  }
};

/**
 * Send test email
 */
export const sendTestEmail = async (testEmail) => {
  try {
    console.log("=== SEND TEST EMAIL START ===");
    console.log("Test email recipient:", testEmail);

    const siteSettings = await getSiteSettings();

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #8D1214;">✅ Email Configuration Test</h2>
        <p>This is a test email from ${siteSettings.siteName}.</p>
        <p>If you received this email, your email configuration is working correctly!</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          Test email sent via Vercel serverless function.
        </p>
      </div>
    `;

    console.log("Sending email via Vercel API...");
    const result = await sendEmailViaAPI(
      testEmail,
      `Test Email - ${siteSettings.siteName}`,
      html
    );

    console.log("=== EMAIL SENT SUCCESSFULLY ===");
    console.log("Result:", result);

    return { success: true, data: result.data };
  } catch (error) {
    console.error("=== ERROR SENDING TEST EMAIL ===");
    console.error("Error:", error);
    throw error;
  }
};

/**
 * Send donation receipt email
 */
export const sendDonationReceipt = async (donorEmail, donationData) => {
  try {
    const siteSettings = await getSiteSettings();
    const { donorName, amount, purpose, donationId, date, receiptNumber } = donationData;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Donation Receipt</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #8D1214;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #8D1214;
      margin: 0;
      font-size: 24px;
    }
    .amount {
      background-color: #8D1214;
      color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      margin: 25px 0;
    }
    .amount h2 {
      margin: 0;
      font-size: 32px;
    }
    .thank-you {
      background-color: #FFF5E1;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      margin: 25px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${siteSettings.siteName}</h1>
      <p>${siteSettings.siteNameTelugu}</p>
    </div>
    
    <div class="amount">
      <h2>₹${amount.toLocaleString('en-IN')}</h2>
      <p>Donation Amount</p>
    </div>
    
    <p><strong>Receipt Number:</strong> ${receiptNumber || donationId}</p>
    <p><strong>Donor Name:</strong> ${donorName}</p>
    <p><strong>Purpose:</strong> ${purpose}</p>
    <p><strong>Date:</strong> ${new Date(date).toLocaleDateString('en-IN')}</p>
    
    <div class="thank-you">
      <h3>🙏 Thank You for Your Generous Donation!</h3>
      <p>May Lord Venkateswara bless you and your family.</p>
    </div>
  </div>
</body>
</html>
    `;

    const result = await sendEmailViaAPI(
      donorEmail,
      `Donation Receipt - ${receiptNumber || donationId}`,
      html
    );

    console.log("Receipt email sent successfully");
    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error sending receipt email:", error);
    throw error;
  }
};

/**
 * Send thank you email
 */
export const sendThankYouEmail = async (donorEmail, donorName) => {
  try {
    const siteSettings = await getSiteSettings();

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Thank You</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 10px;
      padding: 40px;
      text-align: center;
    }
    .icon {
      font-size: 64px;
      margin: 20px 0;
    }
    h1 {
      color: #8D1214;
    }
    .blessing {
      background: linear-gradient(135deg, #FAAC2F 0%, #8D1214 100%);
      color: white;
      padding: 25px;
      border-radius: 8px;
      margin: 30px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">🙏</div>
    <h1>Thank You, ${donorName}!</h1>
    <p>Your generous donation has been received and is deeply appreciated.</p>
    <div class="blessing">
      <p>May Lord Venkateswara shower His divine blessings upon you and your family.</p>
    </div>
  </div>
</body>
</html>
    `;

    const result = await sendEmailViaAPI(
      donorEmail,
      'Thank You for Your Generous Donation',
      html
    );

    console.log("Thank you email sent successfully");
    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error sending thank you email:", error);
    throw error;
  }
};

/**
 * Send both donation emails
 */
export const sendDonationEmails = async (donationData) => {
  try {
    const results = {
      receipt: null,
      thankYou: null,
      errors: [],
    };

    // Send receipt email
    try {
      results.receipt = await sendDonationReceipt(
        donationData.donorEmail,
        donationData
      );
    } catch (error) {
      results.errors.push({ type: 'receipt', error: error.message });
    }

    // Send thank you email
    try {
      results.thankYou = await sendThankYouEmail(
        donationData.donorEmail,
        donationData.donorName
      );
    } catch (error) {
      results.errors.push({ type: 'thankYou', error: error.message });
    }

    return results;
  } catch (error) {
    console.error("Error sending donation emails:", error);
    throw error;
  }
};
