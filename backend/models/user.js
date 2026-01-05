import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    cartData: { type: Object, default: {} },
    googleId: { type: String, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpire: { type: Date, default: null },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { minimize: false, timestamps: true })

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel