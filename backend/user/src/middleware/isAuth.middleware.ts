import { NextFunction, Request, Response } from 'express';
import { IUser } from '../models/user.model.js';
import jwt, { JwtPayload } from 'jsonwebtoken';

// Extend Express's Request interface to include the authenticated user object
export interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}

// Middleware to protect routes by verifying JWT tokens
export const isAuth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        // Extract the Authorization header from the request
        const authHeader = req.headers.authorization;

        // If the Authorization header is missing or doesn't start with "Bearer ", deny access
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                message: 'Please Login - No auth header',
            });

            return;
        }

        // Extract the token from the "Bearer <token>" format
        const token = authHeader.split(' ')[1];

        const decodedValue = jwt.verify(
            token,
            process.env.JWT_SECRET as string,
        ) as JwtPayload;

        if (!decodedValue || !decodedValue.user) {
            res.status(401).json({
                message: 'Invalid token',
            });
            return;
        }

        // Attach the user object to the request for downstream use
        req.user = decodedValue.user;

        next();
    } catch (error) {
        res.status(401).json({
            message: 'Please login - JWT Error',
        });
    }
};
