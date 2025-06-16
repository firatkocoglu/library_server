import jwt, {VerifyErrors} from "jsonwebtoken";
import {NextFunction, Request, Response} from "express";
import {redisClient} from "./redis";
import {JwtUserPayload} from "../types/jwtTypes";

import dotenv from "dotenv";

dotenv.config();

const verifyToken = (token: string, secret: string): Promise<JwtUserPayload> => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err, decoded) => {
            if (err || !decoded) return reject(err);
            resolve(decoded as JwtUserPayload);
        })
    })
}

const getValidTokenData = async (req: Request, res: Response): Promise<{ token: string, secret: string } | void> => {
    const { token } = req.cookies;
    if (!token) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const isBlacklisted: string | null = await redisClient.get(token);
    if (isBlacklisted) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const secret: string | undefined = process.env.JWT_SECRET;
    if (!secret) {
        res.status(500).json({ message: 'Internal server error' });
        return;
    }

    return { token, secret }
}

const isAuthenticated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const result = await getValidTokenData(req, res)
    if (!result) return;

    const { token, secret } = result;

    try {
        req.user = await verifyToken(token, secret) as JwtUserPayload
        return next()
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({ message: 'Token expired' });
        } else {
            res.status(403).json({ message: 'Invalid token' });
        }
        return;
    }
};

const isAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = req.user as JwtUserPayload | undefined;

    if (!user || !user.isAdmin) {
        res.status(403).json({ message: 'You are not authorized to this operation.' });
        return;
    }
    return next();
};


export {isAuthenticated, isAdmin};
