import express from 'express';
import dotenv from 'dotenv';
import { startSendOtpConsumer } from './consumer.js';

dotenv.config();

const app = express();

startSendOtpConsumer();

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});
