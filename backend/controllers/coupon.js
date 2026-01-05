import couponModel from "../models/coupon.js";

// Add new coupon (Admin)
const addCoupon = async (req, res) => {
    try {
        const { code, discountType, discountValue, minPurchase, expiryDate, usageLimit } = req.body;

        if (!code || !discountType || !discountValue || !expiryDate) {
            return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ thông tin" });
        }

        // Check if coupon code already exists
        const existingCoupon = await couponModel.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.status(400).json({ success: false, message: "Mã giảm giá đã tồn tại" });
        }

        const newCoupon = new couponModel({
            code: code.toUpperCase(),
            discountType,
            discountValue,
            minPurchase: minPurchase || 0,
            expiryDate: new Date(expiryDate),
            usageLimit: usageLimit || null,
            isActive: true,
            usedCount: 0
        });

        await newCoupon.save();
        res.json({ success: true, message: "Tạo mã giảm giá thành công" });

    } catch (error) {
        console.error("Add Coupon Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// List all coupons (Admin)
const listCoupons = async (req, res) => {
    try {
        const coupons = await couponModel.find({}).sort({ createdAt: -1 });
        res.json({ success: true, coupons });
    } catch (error) {
        console.error("List Coupons Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete coupon (Admin)
const deleteCoupon = async (req, res) => {
    try {
        const { couponId } = req.body;

        if (!couponId) {
            return res.status(400).json({ success: false, message: "Coupon ID is required" });
        }

        await couponModel.findByIdAndDelete(couponId);
        res.json({ success: true, message: "Xóa mã giảm giá thành công" });

    } catch (error) {
        console.error("Delete Coupon Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Toggle coupon active status (Admin)
const toggleCoupon = async (req, res) => {
    try {
        const { couponId } = req.body;

        if (!couponId) {
            return res.status(400).json({ success: false, message: "Coupon ID is required" });
        }

        const coupon = await couponModel.findById(couponId);
        if (!coupon) {
            return res.status(404).json({ success: false, message: "Không tìm thấy mã giảm giá" });
        }

        coupon.isActive = !coupon.isActive;
        await coupon.save();

        res.json({ success: true, message: `Mã giảm giá đã ${coupon.isActive ? 'kích hoạt' : 'tắt'}` });

    } catch (error) {
        console.error("Toggle Coupon Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Validate coupon (User - at checkout)
const validateCoupon = async (req, res) => {
    try {
        const { code, cartAmount } = req.body;

        if (!code) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập mã giảm giá" });
        }

        const coupon = await couponModel.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return res.status(404).json({ success: false, message: "Mã giảm giá không tồn tại" });
        }

        if (!coupon.isActive) {
            return res.status(400).json({ success: false, message: "Mã giảm giá đã bị vô hiệu hóa" });
        }

        if (new Date() > new Date(coupon.expiryDate)) {
            return res.status(400).json({ success: false, message: "Mã giảm giá đã hết hạn" });
        }

        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ success: false, message: "Mã giảm giá đã hết lượt sử dụng" });
        }

        if (cartAmount < coupon.minPurchase) {
            return res.status(400).json({
                success: false,
                message: `Đơn hàng tối thiểu ${coupon.minPurchase.toLocaleString()}₫ để sử dụng mã này`
            });
        }

        // Calculate discount
        let discount = 0;
        if (coupon.discountType === "percent") {
            discount = Math.round(cartAmount * coupon.discountValue / 100);
        } else {
            discount = coupon.discountValue;
        }

        // Discount cannot exceed cart amount
        if (discount > cartAmount) {
            discount = cartAmount;
        }

        res.json({
            success: true,
            coupon: {
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                discount: discount
            }
        });

    } catch (error) {
        console.error("Validate Coupon Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export { addCoupon, listCoupons, deleteCoupon, toggleCoupon, validateCoupon };