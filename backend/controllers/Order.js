import orderModel from "../models/order.js";
import userModel from "../models/user.js";
import productModel from "../models/product.js";
import couponModel from "../models/coupon.js";
import { createZaloPayUrl } from "./zalopay.js"; 

// --- ĐẶT HÀNG ---
const placeOrder = async (req, res) => {
    try {
        const { items, amount, address, couponCode, paymentMethod } = req.body;
        const userId = req.body.userId;

        if (!items || !amount || !address || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: "Thiếu thông tin bắt buộc: items, amount, address và paymentMethod"
            });
        }

        // 1. Kiểm tra tồn kho (Stock check) trước khi tạo đơn
        for (const item of items) {
            const product = await productModel.findById(item._id);
            if (!product) {
                return res.status(400).json({ success: false, message: `Sản phẩm "${item.name}" không tồn tại` });
            }

            const sizeInfo = product.sizes.find(s => s.size === item.size);
            if (!sizeInfo || sizeInfo.quantity < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Sản phẩm "${item.name}" size ${item.size} đã hết hàng hoặc không đủ số lượng.`
                });
            }
        }

        // 2. Xử lý Coupon (nếu có)
        let finalAmount = amount;
        let appliedCoupon = null;

        if (couponCode) {
            const coupon = await couponModel.findOne({ code: couponCode.toUpperCase(), isActive: true });
            if (coupon && new Date() <= new Date(coupon.expiryDate)) {
                if (coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit) {
                    let discount = (coupon.discountType === "percent") 
                        ? Math.round(amount * coupon.discountValue / 100) 
                        : coupon.discountValue;
                    
                    finalAmount = amount - Math.min(discount, amount);
                    appliedCoupon = coupon;
                }
            }
        }

        // 3. Khởi tạo dữ liệu đơn hàng
        const orderData = {
            userId,
            items,
            amount: finalAmount,
            address,
            paymentMethod,
            payment: false,
            date: Date.now(),
            status: paymentMethod === "COD" ? "Order Placed" : "Pending Payment",
            couponCode: appliedCoupon ? appliedCoupon.code : null
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        // 4. PHÂN LUỒNG XỬ LÝ THEO PHƯƠNG THỨC THANH TOÁN

        // A. TRƯỜNG HỢP: ZALOPAY
        if (paymentMethod === "ZaloPay") {
            req.body.orderId = newOrder._id;
            req.body.amount = finalAmount;
            // Chuyển tiếp sang controller ZaloPay để lấy paymentUrl
            return createZaloPayUrl(req, res);
        }

        // B. TRƯỜNG HỢP: COD (Thanh toán khi nhận hàng)
        if (paymentMethod === "COD") {
            // Cập nhật lượt dùng Coupon
            if (appliedCoupon) {
                await couponModel.findByIdAndUpdate(appliedCoupon._id, { $inc: { usedCount: 1 } });
            }

            // Trừ kho ngay lập tức
            for (const item of items) {
                await productModel.updateOne(
                    { _id: item._id, "sizes.size": item.size },
                    { $inc: { "sizes.$.quantity": -item.quantity } }
                );
            }

            // Xóa giỏ hàng của user
            await userModel.findByIdAndUpdate(userId, { cartData: {} });

            return res.json({ success: true, message: "Đặt hàng thành công", orderId: newOrder._id });
        }

        res.status(400).json({ success: false, message: "Phương thức thanh toán không hợp lệ" });

    } catch (error) {
        console.error("Order placement error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- QUẢN LÝ ĐƠN HÀNG (ADMIN) ---

// Liệt kê tất cả đơn hàng
const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({}).sort({ date: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Cập nhật trạng thái đơn hàng (Admin)
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        const order = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true });
        
        if (!order) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
        }

        res.json({ success: true, message: "Cập nhật trạng thái thành công", order });
    } catch (error) {
        console.error("Update Status Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Xóa đơn hàng và hoàn lại kho (Admin)
const deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await orderModel.findById(orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
        }

        // Nếu đơn đã thanh toán hoặc COD đã trừ kho, cần hoàn lại kho khi xóa
        if (order.payment || order.paymentMethod === "COD") {
            for (const item of order.items) {
                await productModel.updateOne(
                    { _id: item._id, "sizes.size": item.size },
                    { $inc: { "sizes.$.quantity": item.quantity } }
                );
            }
        }

        await orderModel.findByIdAndDelete(orderId);
        res.json({ success: true, message: "Đã xóa đơn hàng và hoàn lại tồn kho" });
    } catch (error) {
        console.error("Delete Order Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- NGƯỜI DÙNG ---

// Lấy danh sách đơn hàng của người dùng cụ thể
const userOrders = async (req, res) => {
    try {
        const { userId } = req.body;
        const orders = await orderModel.find({ userId }).sort({ date: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// --- THỐNG KÊ (DASHBOARD) ---
const adminDashboard = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        const products = await productModel.find({});

        const totalOrders = orders.length;
        const totalProducts = products.length;
        const totalEarnings = orders.filter(o => o.payment).reduce((acc, order) => acc + order.amount, 0);

        res.json({
            success: true,
            stats: { totalOrders, totalProducts, totalEarnings }
        });
    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Các hàm thanh toán quốc tế (Chưa triển khai)
const placeOrderStripe = async (req, res) => { res.json({ message: "Stripe not integrated yet" }) };
const placeOrderRazorpay = async (req, res) => { res.json({ message: "Razorpay not integrated yet" }) };

export { 
    placeOrder, 
    placeOrderRazorpay, 
    placeOrderStripe, 
    allOrders, 
    userOrders, 
    updateStatus, 
    deleteOrder, 
    adminDashboard 
};