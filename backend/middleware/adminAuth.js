import jwt from "jsonwebtoken";
import userModel from "../models/user.js";

const adminAuth = async (req, res, next) => {
    try {
        const { token } = req.headers;
        if (!token) {
            return res.json({ success: false, message: "Not Authorized. Login Again" });
        }

        const token_decode = jwt.verify(token, process.env.JWT_SECRET);

        // Tìm user trong database và kiểm tra role
        const user = await userModel.findById(token_decode.id);

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (user.role !== 'admin') {
            return res.json({ success: false, message: "Access denied. Admin only." });
        }

        // Lưu thông tin user vào request để dùng trong controller
        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export default adminAuth;