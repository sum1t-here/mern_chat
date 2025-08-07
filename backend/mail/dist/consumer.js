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
        // Create a channel to communicate with RabbitMQ
        const channel = await connection.createChannel();
        // Define the queue name to listen to
        const queueName = "send-otp";
        await channel.assertQueue(queueName, { durable: true });
        console.log("Mail service Consumer started for listening otp emails");
        // Consume messages from the "send-otp" queue
        channel.consume(queueName, async (msg) => {
            try {
                const { to, subject, body } = JSON.parse(msg.content.toString());
                // Setup the nodemailer transporter using Gmail SMTP
                const transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 587,
                    secure: false, // true for 465
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASSWORD
                    }
                });
                // Send the actual email
                await transporter.sendMail({
                    from: "chat_app",
                    to,
                    subject,
                    text: body
                });
                console.log(`OTP mail send to ${to}`);
                // Acknowledge the message so it gets removed from the queue
                channel.ack(msg);
            }
            catch (error) {
                console.log("Failed to send OTP", error);
            }
        });
    }
    catch (error) {
        console.log("Failed to start rabbit mq consumer", error);
    }
};
