import http from 'http'
import nodemailer from 'nodemailer'
 import dotenv from 'dotenv';
dotenv.config(); 

//configure the SMTP transporter
const transporter = nodemailer.createTransport({
    host:'smtp.gmail.com',
    port:465,
    secure:true, //true for port 465, false for other port
    auth:{
        user:process.env.EMAIL, // your SMTP username
        pass: process.env.EMAIL_PASS, //your smtp password
    }
});

//function to send gmail
async function sendEmail(to, subject, text, html) {
    try {
        const info = await transporter.sendMail({
            from:process.env.EMAIL, //sender address
            to, //list of receivers
            subject, //subject line
            text,
            html,
        });
        return {success:true, messageId: info.messageId}
    } catch (error) {
        console.error('Error sending email:', error)
        return {success: false, error: error.message}
    }
}

export default sendEmail;