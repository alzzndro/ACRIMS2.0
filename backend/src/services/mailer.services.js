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

// ---------------------------------------------------------------------
// From Instructor to DPD
// ---------------------------------------------------------------------

export async function sendEmailToDpd(from, to, full_name, message) {
    try {
        const emailInfo = {
            from: `"Asian College Instructor" <${from}>`,
            to,
            subject: `Room Change Request from ${full_name}`,
            text: `Good day,

${full_name} has submitted a room change request.

Reason for Room Change:
${message}

To review the full details of the submitted form, please visit the official monitoring system:
acrims.netlify.app

Your prompt attention to this request would be greatly appreciated. Should you require any additional information, please feel free to reach out.

Thank you and have a great day.

Sincerely,
Asian College Instructor
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

// ---------------------------------------------------------------------
// From DPD to RLIC
// ---------------------------------------------------------------------

export async function sendEmailToRlic(from, to, full_name, message) {
    try {
        const emailInfo = {
            from: `"Asian College Instructor" <${process.env.MAILER_EMAIL}>`,
            to,
            subject: `Room Change Request from ${full_name}`,
            text: `Good day,

${full_name} has submitted a room change request.

Reason for Room Change:
${message}

To review the full details of the submitted form, please visit the official monitoring system:
acrims.netlify.app

Your prompt attention to this request would be greatly appreciated. Should you require any additional information, please feel free to reach out.

Thank you and have a great day.

Sincerely,
Asian College Instructor
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
