import axios from 'axios';
import CryptoJS from 'crypto-js';
import orderModel from '../models/order.js';
import userModel from '../models/user.js';
import productModel from '../models/product.js';
import couponModel from '../models/coupon.js';

const config = {
    app_id: process.env.ZLP_APP_ID,
    key1: process.env.ZLP_KEY1,
    key2: process.env.ZLP_KEY2,
    endpoint: process.env.ZLP_ENDPOINT,
    callback_url: process.env.ZLP_CALLBACK_URL,
    redirect_url: process.env.ZLP_REDIRECT_URL
};

// Hàm tạo URL thanh toán
export const createZaloPayUrl = async (req, res) => {
    try {
        const { orderId, amount } = req.body;

        const order = await orderModel.findById(orderId);
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        const embed_data = JSON.stringify({ redirecturl: config.redirect_url });
        const items = JSON.stringify(order.items);
        const transID = Math.floor(Math.random() * 1000000);
        
        // Định dạng app_trans_id: YYMMDD_id
        const app_trans_id = `${new Date().toISOString().slice(2, 10).replace(/-/g, '')}_${orderId}`;

        const zalopayOrder = {
            app_id: config.app_id,
            app_trans_id,
            app_user: order.userId,
            app_time: Date.now(),
            item: items,
            embed_data: embed_data,
            amount: Math.round(amount),
            description: `Thanh toán đơn hàng #${orderId}`,
            bank_code: "",
            callback_url: config.callback_url
        };

        // Tính toán MAC (Message Authentication Code)
        const data = config.app_id + "|" + zalopayOrder.app_trans_id + "|" + zalopayOrder.app_user + "|" + zalopayOrder.amount + "|" + zalopayOrder.app_time + "|" + zalopayOrder.embed_data + "|" + zalopayOrder.item;
        zalopayOrder.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

        const result = await axios.post(config.endpoint, null, { params: zalopayOrder });
        
        if (result.data.return_code === 1) {
            res.json({ success: true, payment_url: result.data.order_url });
        } else {
            res.status(400).json({ success: false, message: result.data.return_message });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Hàm xử lý Callback
export const zalopayCallback = async (req, res) => {
    let result = {};
    try {
        const { data: dataStr, mac } = req.body;
        const checkMac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();

        if (mac !== checkMac) {
            result.return_code = -1;
            result.return_message = "mac not equal";
        } else {
            const dataJson = JSON.parse(dataStr);
            const orderId = dataJson["app_trans_id"].split("_")[1];

            // Cập nhật đơn hàng trong DB
            const order = await orderModel.findById(orderId);
            if (order && !order.payment) {
                order.payment = true;
                order.status = "Đã thanh toán";
                order.paymentMethod = "ZaloPay";
                await order.save();

                // Trừ kho và xóa giỏ hàng giống logic VNPay cũ
                for (const item of order.items) {
                    await productModel.updateOne(
                        { _id: item._id, "sizes.size": item.size },
                        { $inc: { "sizes.$.quantity": -item.quantity } }
                    );
                }
                await userModel.findByIdAndUpdate(order.userId, { cartData: {} });
            }

            result.return_code = 1;
            result.return_message = "success";
        }
    } catch (ex) {
        result.return_code = 0;
        result.return_message = ex.message;
    }
    res.json(result);
};