import {Pool, PoolClient} from "pg";
import {Request} from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {UserRow} from "../types/dbTypes";
import {AuthRepository} from "../repositories/authRepository";
import {redisClient} from "../middleware/redis";

import dotenv from "dotenv";

dotenv.config();

export class AuthService {
    private authRepo: AuthRepository;

    constructor(private pool: Pool) {
        this.authRepo = new AuthRepository(pool);
    }

    public async registerUser(input: {
        email: string,
        password: string,
        name: string,
        surname: string,
    }): Promise<{ error?: string; status: number; user?: Omit<UserRow, "password"> }> {
        const client: PoolClient = await this.pool.connect();

        try {
            // Check whether a user already exists
            const exists: boolean = await this.authRepo.doesUserExistByEmail(input.email, client);

            // If user exists return an error
            if (exists) {
                return { error: "User already exists", status: 400 };
            }

            // Hash given password
            const hashedPassword = await bcrypt.hash(input.password, 10);
            console.log(hashedPassword, typeof hashedPassword)

            // Create user
            const newUser = await this.authRepo.createUser(
                { email: input.email, password: hashedPassword, name: input.name, surname: input.surname }, client
            );

            return { status: 201, user: newUser };
        } catch (error) {
            console.error(error);
            return { error: "Internal server error", status: 500 };
        } finally {
            client.release();
        }
    }

    public async loginUser(input: { email: string, password: string }): Promise<{
        error?: string;
        status: number;
        user?: Omit<UserRow, 'password'>,
        token?: string
    }> {
        const client: PoolClient = await this.pool.connect();

        try {
            // Login user
            const user: UserRow | null = await this.authRepo.loginUser({
                email: input.email,
                password: input.password
            }, client);
            // If a user can't log in with given credentials

            if (!user) {
                return { error: "Invalid email or password", status: 401 };
            }

            // Check if the password is correct
            const isMatch: boolean = await bcrypt.compare(input.password, user.password);

            if (!isMatch) {
                return { error: 'Check your username and password', status: 404 }
            }

            const secret = process.env.JWT_SECRET;

            if (!secret) {
                console.error("JWT_SECRET not defined");
                return { error: 'Internal server error', status: 500 }
            }

            const token: string = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    isAdmin: user.is_admin,
                    name: user.name,
                    surname: user.surname
                },
                secret,
                {
                    expiresIn: "1d",
                }
            );

            const { password, ...userWithoutPassword } = user

            return { token, status: 200, user: userWithoutPassword };
        } catch (error) {
            console.error(error);
            return { error: 'Internal server error', status: 500 }
        } finally {
            client.release();
        }
    }

    public async logoutUser(req: Request): Promise<{ error?: string, status: number }> {
        try {
            const { token } = req.cookies;

            if (!token) {
                return { error: "No token provided", status: 401 };
            }

            // Check if the token is already blacklisted
            const isBlacklisted = await redisClient.get(token);

            if (isBlacklisted) {
                return { error: "User already logged out.", status: 401 };
            }

            // Decode token
            const decoded = jwt.decode(token);

            if (!decoded || typeof decoded !== "object" || !("exp" in decoded)) {
                return { error: "Invalid or expired token", status: 401 };
            }

            const expiration = decoded.exp;

            if (!expiration || typeof expiration !== "number") {
                return { error: 'Invalid or expired token', status: 401 }
            }

            const ttl = expiration - Math.floor(Date.now() / 1000);

            if (ttl > 0) {
                await redisClient.set(token, "blacklisted", { EX: ttl });
                return { status: 200 };
            } else {
                return { error: "Token already expired", status: 500 };
            }
        } catch (error) {
            console.error("Error logging out user:", error);
            return { error: "Internal Server Error", status: 500 };
        }
    }
}


