import nodemailer from 'nodemailer'
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAILER_EMAIL,
        pass: process.env.MAILER_PASS,
    },
})

export async function sendEmailAbsent(to) {
    try {
        const emailInfo = {
            from: process.env.MAILER_EMAIL,
            to,
            subject: `Good day! ${to}`,
            text: "This is from the nurses office, we would like to inform you that you are absent or not in your respective classroom today!"
        }

        console.log(`Message sent to ${to}`)
        return await transporter.sendMail(emailInfo)
    } catch (error) {
        console.log("Error in: ", error);
    }
}

console.log("MAILER_EMAIL:", process.env.MAILER_EMAIL);
console.log("MAILER_PASS is defined:", !!process.env.MAILER_PASS);