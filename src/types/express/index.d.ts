import {JwtUserPayload} from "../jwtTypes";

declare module "express-serve-static-core" {
    interface Request {
        user?: JwtUserPayload
    }
}