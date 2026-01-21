import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function sendApprovalEmail(to: string, requestDetails: any, id: number) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const approveLink = `${baseUrl}/action?id=${id}&action=approve`;
    const rejectLink = `${baseUrl}/action?id=${id}&action=reject`;

    try {
        const info = await transporter.sendMail({
            from: `"Approval System" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to,
            subject: 'New Approval Request',
            text: `You have a new approval request (ID: ${id}).\n\nDetails: ${JSON.stringify(requestDetails, null, 2)}\n\nApprove: ${approveLink}\nReject: ${rejectLink}\n\nPlease check the app to approve or reject.`,
            html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>New Approval Request #${id}</h2>
              <pre style="background: #f4f4f4; padding: 10px; border-radius: 5px;">${JSON.stringify(requestDetails, null, 2)}</pre>
              <div style="margin-top: 20px;">
                <a href="${approveLink}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px;">Approve</a>
                <a href="${rejectLink}" style="background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reject</a>
              </div>
              <p style="margin-top: 20px; color: #666; font-size: 12px;">If links don't work, login to the app manually.</p>
            </div>
            `,
        });

        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        // Don't throw, just log, so flow isn't interrupted? Or should we throw?
        // User requirement: "email e y thakle mail akare apporaval jabe na hoi jabe na" -> if y, send mail.
        // If it fails, we probably should at least log it.
    }
}
