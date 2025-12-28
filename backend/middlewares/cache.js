const { cache } = require('../config/redis');

const cacheMiddleware = (keyPrefix, ttl = 3600) => {
    return async (req, res, next) => {
        if (req.method !== 'GET') {
            return next();
        }
        try {
            const cacheKey = `${keyPrefix}:${req.originalUrl || req.url}`;
            const cachedData = await cache.get(cacheKey);
            
            if (cachedData) {
                console.log(`Cache hit: ${cacheKey}`);
                return res.status(200).json({
                    ...cachedData,
                    cached: true,
                    timestamp: new Date().toISOString()
                });
            }
            console.log(`🔍 Cache miss: ${cacheKey}`);
            const originalJson = res.json;
            res.json = function(data) {
                if (res.statusCode === 200 && !data.cached) {
                    cache.set(cacheKey, data, ttl).then(() => {
                        console.log(`Cache saved: ${cacheKey}`);
                    }).catch(err => {
                        console.error('Cache save error:', err.message);
                    });
                }
                return originalJson.call(this, data);
            };    
            next();
        } catch (error) {
            console.error('Cache middleware error:', error.message);
            next(); 
        }
    };
};

const clearCacheMiddleware = (patterns = []) => {
    return async (req, res, next) => {
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
            req.clearCache = async (additionalPatterns = []) => {
                try {
                    const allPatterns = [...patterns, ...additionalPatterns];
                    let totalCleared = 0;
                    
                    for (const pattern of allPatterns) {
                        const keys = await cache.keys(pattern);
                        if (keys.length > 0) {
                            await Promise.all(keys.map(key => cache.del(key)));
                            console.log(`🧹 Cleared cache for pattern: ${pattern}, keys: ${keys.length}`);
                            totalCleared += keys.length;
                        }
                    }
                    if (req.body.cacheKey) {
                        await cache.del(req.body.cacheKey);
                        totalCleared++;
                    }
                    
                    console.log(`Total cache cleared: ${totalCleared} keys`);
                    return totalCleared;
                } catch (error) {
                    console.error('Clear cache error:', error.message);
                    return 0;
                }
            };
        }
        
        next();
    };
};

module.exports = { cacheMiddleware, clearCacheMiddleware };