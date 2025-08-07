import express from "express";
import dotenv from "dotenv";
import connectDb from "./configs/db.config.js";
import { createClient } from "redis";
import userRoutes from "./routes/user.route.js";
import { connectRabbitMq } from "./configs/rabbitmq.config.js";

dotenv.config();

connectDb();
connectRabbitMq();

export const redisClient = createClient({
    url: process.env.REDIS_URI
});

redisClient.on("error", (err) => {
    throw(err);
});

await redisClient.connect()
    .then(() => console.log("Connected to redis !!!"))
    .catch(console.error);

const app = express();

app.use(express.json());

app.use("/api/v1", userRoutes);

const port = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})