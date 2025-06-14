import express from 'express';
import {connectRedis} from './middleware/redis';

const app = express();
import morgan from 'morgan';
import cors from 'cors';
import helmet from "helmet";
import cookieParser from "cookie-parser";
import dotenv from 'dotenv'
import {apiRouter} from "./routes/apiRoutes";

const port = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

dotenv.config();

app.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true,
    })
);

app.use(helmet());
app.use(cookieParser());

app.use(morgan('dev'));
app.use('/', apiRouter);


app.listen(port, () => {
    console.log(
        `Connected to Neon Database. Server is running on port ${ port }. Visit http://localhost:${ port }.`
    );
});

connectRedis().catch((err) => {
    console.log('Redis Client Error', err);
});
