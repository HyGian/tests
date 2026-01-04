const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const { connectRedis } = require('./config/redis');
const http = require('http');
const SocketServer = require('./socket/socketServer');
const initRoutes = require('./routes/index');
const passport = require('./config/passport');
const dotenv = require('dotenv'); 

dotenv.config(); 

const app = express();
const server = http.createServer(app);

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));


const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Ecommerce_System');

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);


        require('./models/user');
        require('./models/admin');
        require('./models/category');
        require('./models/product');
        require('./models/review');
        require('./models/shippingaddress');
        require('./models/order');
        require('./models/customersupport');
        
        console.log(' All Models Loaded Successfully');
        
    } catch (error) {
        console.error(` Database Error: ${error.message}`);
        process.exit(1); 
    }
};

// Chạy kết nối DB
connectDB();

// Khởi tạo Socket
const socketServer = new SocketServer(server);

// Khởi tạo Routes
initRoutes(app);

const PORT = process.env.PORT || 8888;

server.listen(PORT, () => { 
    console.log(`Server running on port ${PORT}`);
    console.log(`Socket.IO ready`);
    console.log(`Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});

module.exports = { app, server, socketServer };