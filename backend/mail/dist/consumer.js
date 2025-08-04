import amqp from "amqplib";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
export const startSendOtpConsumer = async () => {
    try {
        const connection = await amqp.connect({
            protocol: "amqp",
            hostname: process.env.RABBITMQ_HOST,
            port: 5672,
            username: process.env.RABBITMQ_USERNAME,
            password: process.env.RABBITMQ_PASSWORD
        });
        const channel = await connection.createChannel();
        const queueName = "send-otp";
        console.log("Mail service Consumer started for listening otp emails");
        channel.consume(queueName, async (msg) => {
            try {
                const { to, subject, body } = JSON.parse(msg.content.toString());
                const transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 465,
                    auth: {
                        user: process.env.USER,
                        pass: process.env.PASSWORD
                    }
                });
                await transporter.sendMail({
                    from: "chat_app",
                    to,
                    subject,
                    text: body
                });
                console.log(`OTP mail send to ${to}`);
                channel.ack(msg);
            }
            catch (error) {
                console.log("Failed to send OTP", error);
            }
        });
        await channel.assertQueue(queueName, { durable: true });
    }
    catch (error) {
        console.log("Failed to start rabbit mq consumer", error);
    }
};
