import express from 'express'
import http from 'http'; //
import { Server } from 'socket.io'; //
import cors from 'cors'
import 'dotenv/config'
import { createClient } from 'redis';
import RedisStore from 'rate-limit-redis';
import rateLimit from 'express-rate-limit';
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'

// Import Routes
import user from './routes/user.js'
import product from './routes/product.js'
import cart from './routes/cart.js'
import Order from './routes/Order.js'
import coupon from './routes/coupon.js'
import zalopayRouter from './routes/zalopay.js';
import chatbot from './routes/chatbot.js'
import category from './routes/category.js'
import chatRouter from './routes/chat.js';


import chatSocket from './socket/socketServer.js'; 


const app = express()
const port = process.env.PORT || 4000

const server = http.createServer(app); 

const io = new Server(server, {
    cors: {
        origin:"*",
        methods: ["GET", "POST"]
    }
});

connectDB()
connectCloudinary()

const redisClient = createClient();
await redisClient.connect();

const securityLimiter = rateLimit({
    store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
    }),
    windowMs: 5 * 60 * 1000, 
    max: 5, 
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: "Đợi 5 phút nhé"
        });
    }
});


app.use(express.json())
app.use(cors())

chatSocket(io);

app.use('/api/user/login', securityLimiter);
app.use('/api/user/register', securityLimiter);
app.use('/api/user', user)
app.use('/api/product', product)
app.use('/api/cart', cart)
app.use('/api/order', Order)
app.use('/api/coupon', coupon)
app.use('/api/chatbot', chatbot)
app.use('/api/category', category)
app.use('/api/zalopay', zalopayRouter);
app.use('/api/chat', chatRouter);

app.get('/', (req, res) => {
    res.send("API Working with Private Chat Socket")
})

server.listen(port, () => console.log('Server started on PORT : ' + port))