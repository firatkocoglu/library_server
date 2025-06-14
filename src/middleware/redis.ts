import {createClient} from 'redis';

const redisClient = createClient({
    socket: {
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : undefined,
        host: process.env.REDIS_HOST,
    }
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

redisClient.on('connect', () => {
    console.log('Redis Client Connected');
});

async function connectRedis() {
    await redisClient.connect();
}

export {
    redisClient, connectRedis
};
