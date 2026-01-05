import mongoose from 'mongoose';
import orderModel from './models/order.js';
import productModel from './models/product.js';
import userModel from './models/user.js';
import dotenv from 'dotenv';
dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("DB Connected");

    const product = new productModel({
        name: "Test T-Shirt",
        description: "A test product for dashboard verification",
        price: 100,
        image: ["http://example.com/image.png"],
        category: "Men",
        subCategory: "Topwear",
        sizes: [{size: "M", quantity: 10}],
        bestseller: false,
        date: Date.now()
    });
    const savedProduct = await product.save();
    console.log("Product created:", savedProduct._id);

    // Create User (dummy)
    // We don't strictly need a user for the dashboard logic as it aggregates orders, 
    // but orderModel usually requires userId. We can fake an ObjectId.
    // Let's make a real one just in case.
    // actually, let's just use a random ID if we don't care about the user record itself for this test.
    const userId = new mongoose.Types.ObjectId();

    // Create Order
    const order = new orderModel({
        userId: userId,
        items: [{
            _id: savedProduct._id,
            name: savedProduct.name,
            price: savedProduct.price,
            quantity: 1,
            image: savedProduct.image,
            size: "M"
        }],
        amount: 110, // 100 + 10 shipping
        address: {firstName: "Test", lastName: "User", street: "123 St", city: "Test City"},
        status: "Order Placed",
        paymentMethod: "COD",
        payment: false, 
        date: Date.now()
    });
    await order.save();
    console.log("Order created with amount 110");

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
seedDB();