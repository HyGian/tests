import userModel from '../models/user.js'
import { redisClient } from '../config/redis.js' 

const fetchCartData = async (userId) => {
    const cacheKey = `cart:${userId}`;
    
    let cartData = await redisClient.get(cacheKey);
    if (cartData) return JSON.parse(cartData);

    const userData = await userModel.findById(userId);
    cartData = userData.cartData || {};
    
    // Lưu vào Redis 
    await redisClient.set(cacheKey, JSON.stringify(cartData));
    return cartData;
};

const addToCart = async (req, res) => {
    try {
        const { userId, itemId, size } = req.body;
        const cacheKey = `cart:${userId}`;

        let cartData = await fetchCartData(userId);

        //cập nhật giỏ hàng 
        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1;
            } else {
                cartData[itemId][size] = 1;
            }
        } else {
            cartData[itemId] = {};
            cartData[itemId][size] = 1;
        }

        await redisClient.set(cacheKey, JSON.stringify(cartData));

        await userModel.findByIdAndUpdate(userId, { cartData });

        res.json({ success: true, message: "Added To Cart" });
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const updateCart = async (req, res) => {
    try {
        const { userId, itemId, size, quantity } = req.body;
        const cacheKey = `cart:${userId}`;

        let cartData = await fetchCartData(userId);

        if (quantity > 0) {
            cartData[itemId][size] = quantity;
        } else {
            delete cartData[itemId][size];
            if (Object.keys(cartData[itemId]).length === 0) delete cartData[itemId];
        }

        await redisClient.set(cacheKey, JSON.stringify(cartData));
        await userModel.findByIdAndUpdate(userId, { cartData });

        res.json({ success: true, message: "Cart Updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const getUserCart = async (req, res) => {
    try {
        const { userId } = req.body;

        const cartData = await fetchCartData(userId);

        res.json({ success: true, cartData });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { addToCart, updateCart, getUserCart }