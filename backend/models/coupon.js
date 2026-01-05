import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    discountType: { type: String, enum: ["percent", "fixed"], required: true },
    discountValue: { type: Number, required: true },
    minPurchase: { type: Number, default: 0 },
    expiryDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    usageLimit: { type: Number, default: null },
    usedCount: { type: Number, default: 0 }
}, { timestamps: true });

const couponModel = mongoose.models.coupon || mongoose.model("coupon", couponSchema);

export default couponModel;