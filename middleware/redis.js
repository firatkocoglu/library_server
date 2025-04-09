const { createClient } = require('redis');

const redisClient = createClient({
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

redisClient.on('connect', () => {
  console.log('Redis Client Connected');
});
async function connectRedis() {
  await redisClient.connect();
}

module.exports = {
  redisClient,
  connectRedis,
};
