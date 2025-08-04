import amqp from "amqplib";
let channel;
export const connectRabbitMq = async () => {
    try {
        const connection = await amqp.connect({
            protocol: "amqp",
            hostname: process.env.RABBITMQ_HOST,
            port: 5672,
            username: process.env.RABBITMQ_USERNAME,
            password: process.env.RABBITMQ_PASSWORD
        });
        channel = await connection.createChannel();
        console.log("Connected to Rabbit Mq !!!");
    }
    catch (error) {
        console.log("Failed to connect to Rabbit Mq", error);
    }
};
export const publishToQueue = async (queueName, message) => {
    if (!channel) {
        console.log("Rabbit Mq channel is not initialised");
        return;
    }
    // durable -> retry after err
    await channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), { persistent: true });
};
