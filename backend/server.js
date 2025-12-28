const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/connectDB');
const { connectRedis } = require('./config/redis');
const passport = require('./config/passport');
const initRoutes = require('./routes/index');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));

app.use(session({
    secret: process.env.SESSION_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 
    }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

connectDB();
connectRedis();

initRoutes(app);

const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
