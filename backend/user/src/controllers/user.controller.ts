import TryCatch from "../configs/catch.config.js";
import { generateJWTToken } from "../configs/genToken.config.js";
import { publishToQueue } from "../configs/rabbitmq.config.js";
import { redisClient } from "../index.js";
import { AuthenticatedRequest } from "../middleware/isAuth.middleware.js";
import { User } from "../models/user.model.js";

export const loginUser = TryCatch(async(req, res) => {
    const {email} = req.body;

    // Define a Redis key to implement rate limiting per user
    const rateLimitKey = `otp:rateLimit:${email}`;

    // Check if the rate limit key exists in Redis (i.e., OTP was requested recently)
    const rateLimit = await redisClient.get(rateLimitKey);

    if(rateLimit){
        // If user is requesting too frequently, block the request
        res.status(429).json({
            message: "Too many requests. Please wait before requesting new otp"
        });
    };

    // Generate a 6-digit random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Define a Redis key to store the OTP
    const otpKey = `otp:${email}`;

    // Store the OTP in Redis with a 5-minute expiration (300 seconds)
    await redisClient.set(otpKey, otp, {
        EX: 300,
    });

    // Set the rate limit key with a 1-minute expiration (60 seconds)
    // Prevents user from requesting another OTP too soon
    await redisClient.set(rateLimitKey, "true", {
        EX: 60,
    });

    // Construct the message to be sent via RabbitMQ for email delivery
    const message = {
        to: email,
        subject: "Your otp code",
        body: `Your OTP is ${otp}. It is valid for 5 minutes`,
    };

    // Publish the message to the "send-otp" queue
    await publishToQueue("send-otp", message);

    // Respond to the client that the OTP has been sent
    res.status(200).json({
        message: "OTP sent to your mail",
    });
});

export const verifyUser = TryCatch(async (req, res) => {
    const {email, otp: enteredOtp} = req.body;

    if(!email || !enteredOtp) {
        res.status(400).json({
            message: "Email & OTP are required !!!",
        });

        return;
    }

    // generate the format of otp key to check
    const otpKey = `otp:${email}`;

    const stored_otp = await redisClient.get(otpKey);

    if(!stored_otp || stored_otp !== enteredOtp) {
        res.status(400).json({
            message: "Invalid or Expires OTP",
        });
        return;
    }

    // if otp exists delete the otp
    await redisClient.del(otpKey);

    // find the user by email
    let user = await User.findOne({email});

    if(!user){
        const name = email.slice(0, 8);
        // if no user exists create user
        user = await User.create({name, email});
    }

    const token = generateJWTToken(user);

    res.json({
        message: "User Verified",
        user,
        token
    });
});

export const userProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    res.json(user);
});

export const updateName = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = await User.findById(req.user?._id);

    if(!user) {
        res.status(401).json({
            message: "Please Login",
        })
    };

    user!.name = req.body.name;

    await user?.save();

    // update the token with new user name
    const token = generateJWTToken(user);

    res.json({
        message: "User updated",
        user,
        token,
    });
});

export const getAllUsers = TryCatch(async(req: AuthenticatedRequest, res) => {
    const users = await User.find();

    res.json(users);
});

export const getUser = TryCatch(async(req, res) => {
    const user = await User.findById(req.params.id);

    res.json(user);
})