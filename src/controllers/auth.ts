import {Request, Response, RequestHandler, NextFunction} from "express";
import {RegisterBody, LoginBody} from "../types/authTypes";
import {AuthService} from "../services/authServices";

export class AuthController {
    constructor(private authService: AuthService) {
    }

    public register: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { email, password, name, surname } = req.body as RegisterBody;

        if (typeof email !== "string" || !email.trim() || typeof password !== "string" || !password.trim() || typeof name !== "string" || !name.trim() || typeof surname !== "string" || !surname.trim()) {
            res.status(400).json({ error: "All fields are required and they must be string." });
            return;
        }


        const { error, status, user } = await this.authService.registerUser({
            email, password, name, surname
        })

        if (error) {
            res.status(status).json({ error });
            return
        }

        res.status(status).json({ message: "User created successfully", user });
    };

    public login: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { email, password } = req.body as LoginBody;

        if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password.trim()) {
            res.status(400).json({ error: "Email and password are required" });
            return
        }

        // Login user
        const loginUser = await this.authService.loginUser({ email, password });

        const { error, status, user, token } = loginUser

        if (error || !token || !user) {
            res.status(status).json({ error });
            return;
        }

        // Set cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24,
        });

        res.status(status).json({
            message: "Login successful",
            user
        });
    }

    public logout: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const logout = await this.authService.logoutUser(req);
        const { error, status } = logout

        if (error) {
            res.status(status).json({ error });
            return;
        }

        res.clearCookie("token");

        res.status(status).json({ message: "Logout successful" });
    }
}






