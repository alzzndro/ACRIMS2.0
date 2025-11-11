import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAILER_EMAIL,
        pass: process.env.MAILER_PASS,
    },
});

/**
 * Send a formal email notifying the recipient of absence.
 * @param {string} to - The recipient's email address.
 */
export async function sendEmailAbsent(to) {
    try {
        const emailInfo = {
            from: `"Asian College Monitoring Team" <${process.env.MAILER_EMAIL}>`,
            to,
            subject: "Attendance Notice – Absence Notification",
            text: `Good day,

This is an official message from the Asian College Monitoring Team.

We would like to inform you that you were marked as *absent* or not present in your respective classroom today.

If you have any valid reason or concerns regarding your attendance, please reply to this email as soon as possible.

Thank you for your prompt attention.

Sincerely,
Asian College Monitoring Team
Asian College
monitoring@asiancollege.edu
`,
        };

        const info = await transporter.sendMail(emailInfo);
        console.log(`Message sent to ${to}: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

console.log("MAILER_EMAIL:", process.env.MAILER_EMAIL);
console.log("MAILER_PASS is defined:", !!process.env.MAILER_PASS);
