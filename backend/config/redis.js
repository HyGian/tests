const redis = require('redis');

const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                console.log('Too many retries on Redis. Giving up.');
                return new Error('Too many retries.');
            }
            return Math.min(retries * 100, 3000);
        }
    }
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err.message));
redisClient.on('connect', () => console.log('Redis Connected'));
redisClient.on('ready', () => console.log('Redis Ready'));
redisClient.on('end', () => console.log('Redis Disconnected'));
redisClient.on('reconnecting', () => console.log('Redis Reconnecting'));

const connectRedis = async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
            console.log('Redis connection established');
        }
    } catch (error) {
        console.error('Redis connection failed:', error.message);
    }
};

const cache = {
    get: async (key) => {
        try {
            if (!redisClient.isOpen) {
                await connectRedis();
                if (!redisClient.isOpen) return null;
            }
            const data = await redisClient.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Redis GET error for key', key, ':', error.message);
            return null;
        }
    },

    set: async (key, value, ttl = 3600) => {
        try {
            if (!redisClient.isOpen) {
                await connectRedis();
                if (!redisClient.isOpen) return;
            }
            
            await redisClient.setEx(key, ttl, JSON.stringify(value));
        } catch (error) {
            console.error('Redis SET error for key', key, ':', error.message);
        }
    },

    del: async (key) => {
        try {
            if (!redisClient.isOpen) {
                await connectRedis();
                if (!redisClient.isOpen) return;
            }
            
            await redisClient.del(key);
        } catch (error) {
            console.error('Redis DEL error for key', key, ':', error.message);
        }
    },

    flushAll: async () => {
        try {
            if (!redisClient.isOpen) {
                await connectRedis();
                if (!redisClient.isOpen) return;
            }
            
            await redisClient.flushAll();
            console.log('Redis cache cleared');
        } catch (error) {
            console.error('Redis FLUSHALL error:', error.message);
        }
    },

    keys: async (pattern) => {
        try {
            if (!redisClient.isOpen) {
                await connectRedis();
                if (!redisClient.isOpen) return [];
            }
            
            return await redisClient.keys(pattern);
        } catch (error) {
            console.error('Redis KEYS error:', error.message);
            return [];
        }
    },

    ping: async () => {
        try {
            if (!redisClient.isOpen) {
                await connectRedis();
                if (!redisClient.isOpen) return false;
            }
            
            const result = await redisClient.ping();
            return result === 'PONG';
        } catch (error) {
            console.error('Redis PING error:', error.message);
            return false;
        }
    },

    info: async () => {
        try {
            if (!redisClient.isOpen) {
                await connectRedis();
                if (!redisClient.isOpen) return null;
            }
            
            const info = await redisClient.info();
            return info;
        } catch (error) {
            console.error('Redis INFO error:', error.message);
            return null;
        }
    }
};

module.exports = { redisClient, connectRedis, cache };