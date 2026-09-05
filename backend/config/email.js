import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'admin@kashvi.com',
    pass: process.env.EMAIL_PASS || 'password',
  },
});

export default transporter;
