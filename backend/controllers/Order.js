import orderModel from "../models/order.js";
import userModel from "../models/user.js";
import productModel from "../models/product.js";
import couponModel from "../models/coupon.js";

const placeOrder = async (req, res) => {
  try {
    const { items, amount, address, couponCode } = req.body;

    if (!items || !amount || !address) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: items, amount, and address are required"
      });
    }

    const userId = req.body.userId;
    if (!userId) throw new Error("User not authenticated");

    // Check stock availability for all items first
    for (const item of items) {
      const product = await productModel.findById(item._id);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Sản phẩm "${item.name}" không tồn tại`
        });
      }

      const sizeInfo = product.sizes.find(s => s.size === item.size);
      if (!sizeInfo) {
        return res.status(400).json({
          success: false,
          message: `Size "${item.size}" không có sẵn cho sản phẩm "${item.name}"`
        });
      }

      if (sizeInfo.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Sản phẩm "${item.name}" (Size ${item.size}) chỉ còn ${sizeInfo.quantity} trong kho, bạn đặt ${item.quantity}`
        });
      }
    }

    // Handle coupon if provided
    let finalAmount = amount;
    let appliedCoupon = null;

    if (couponCode) {
      const coupon = await couponModel.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && new Date() <= new Date(coupon.expiryDate)) {
        if (coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit) {
          let discount = 0;
          if (coupon.discountType === "percent") {
            discount = Math.round(amount * coupon.discountValue / 100);
          } else {
            discount = coupon.discountValue;
          }
          if (discount > amount) discount = amount;
          finalAmount = amount - discount;
          appliedCoupon = coupon;
        }
      }
    }

    // All items are available, create the order
    const newOrder = new orderModel({
      userId,
      items,
      amount: finalAmount,
      address,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
      couponCode: appliedCoupon ? appliedCoupon.code : null
    });

    await newOrder.save();

    // Increment coupon usage if applied
    if (appliedCoupon) {
      await couponModel.findByIdAndUpdate(appliedCoupon._id, { $inc: { usedCount: 1 } });
    }

    // Decrease product stock
    for (const item of items) {
      await productModel.updateOne(
        { _id: item._id, "sizes.size": item.size },
        { $inc: { "sizes.$.quantity": -item.quantity } }
      );
    }

    await userModel.findByIdAndUpdate(userId, { cartData: {} });
    res.json({ success: true, message: "Đặt hàng thành công", orderId: newOrder._id });
  } catch (error) {
    console.error("Order placement error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};



const placeOrderStripe = async (req, res) => {

}

const placeOrderRazorpay = async (req, res) => {

}

const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({})
    res.json({ success: true, orders })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const userOrders = async (req, res) => {
  try {
    const { userId } = req.body
    const orders = await orderModel.find({ userId })
    res.json({ success: true, orders })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({ success: false, message: "Order ID and status are required" });
    }

    const order = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, message: "Status Updated", order });
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    // First, find the order to get its items
    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Restore stock for each item in the order
    for (const item of order.items) {
      await productModel.updateOne(
        { _id: item._id, "sizes.size": item.size },
        { $inc: { "sizes.$.quantity": item.quantity } }
      );
    }

    // Now delete the order
    await orderModel.findByIdAndDelete(orderId);

    res.json({ success: true, message: "Order Deleted & Stock Restored" });
  } catch (error) {
    console.error("Delete Order Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const adminDashboard = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    const products = await productModel.find({});

    const totalOrders = orders.length;
    const totalProducts = products.length;

    const totalEarnings = orders.reduce((acc, order) => {
      return acc + order.amount;
    }, 0);

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalProducts,
        totalEarnings
      }
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export { placeOrder, placeOrderRazorpay, placeOrderStripe, allOrders, userOrders, updateStatus, deleteOrder, adminDashboard }