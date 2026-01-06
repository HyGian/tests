import { createClient } from 'redis';

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Lỗi kết nối ', err));

const connectRedis = async () => {
    await redisClient.connect();
    console.log("Đã kết nối Redis!");
};

export { redisClient, connectRedis };