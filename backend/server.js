import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/connectDB.js'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './routes/user.js'
import productRouter from './routes/Product.js'
import cartRouter from './routes/cart.js'
import orderRouter from './routes/Order.js'
import couponRouter from './routes/coupon.js'
import vnpayRouter from './routes/vnpay.js'
import chatbotRouter from './routes/chatbot.js'
import categoryRouter from './routes/category.js'

//App Config
const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

//Middleware
app.use(express.json())
app.use(cors())

// api endpoints
app.use('/api/user', userRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)
app.use('/api/coupon', couponRouter)
app.use('/api/vnpay', vnpayRouter)
app.use('/api/chatbot', chatbotRouter)
app.use('/api/category', categoryRouter)

app.get('/', (req, res) => {
    res.send("API Working")
})

app.listen(port, () => console.log('Server started on PORT : ' + port))