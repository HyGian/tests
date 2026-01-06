import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import userModel from "../models/user.js";

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "Tài khoản không tồn tại" });
        }

        // Check if user registered via Google (no password)
        if (!user.password) {
            return res.json({
                success: false,
                message: "Tài khoản này được đăng ký bằng Google. Vui lòng sử dụng nút 'Đăng nhập với Google'."
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const token = createToken(user._id);
            return res.json({ success: true, token });
        } else {
            res.json({ success: false, message: "Sai mật khẩu" });
        }
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// Route for user register
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        //check user already exists or not
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" })
        }
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

        if (!passwordRegex.test(password)) {
            return res.json({ 
                success: false, 
                message: "Mật khẩu phải có ít nhất 6 ký tự gồm cả chữ và số." 
            });
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        })

        const user = await newUser.save()

        const token = createToken(user._id)

        res.json({ success: true, token })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

//Route for admin login
const adminLogin = async (req, res) => {

    try {
        const { email, password } = req.body;

        // Check credentials against .env
        if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        // Find or create admin user in database
        let adminUser = await userModel.findOne({ email: process.env.ADMIN_EMAIL });

        if (!adminUser) {
            // Create admin user if not exists
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);

            adminUser = new userModel({
                name: "Admin",
                email: process.env.ADMIN_EMAIL,
                password: hashedPassword,
                role: 'admin'
            });
            await adminUser.save();
            console.log("Admin user created in database.");
        } else if (adminUser.role !== 'admin') {
            // Ensure user has admin role
            adminUser.role = 'admin';
            await adminUser.save();
        }

        // Generate proper token with user ID
        const token = createToken(adminUser._id);
        return res.json({ success: true, token });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Forgot Password - Send reset email
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.json({ success: false, message: "Vui lòng nhập email" });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            // Don't reveal if user exists or not for security
            return res.json({ success: true, message: "Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu" });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Save to user (expires in 15 minutes)
        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
        await user.save();

        // Create reset URL - Frontend will handle this route
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

        // Setup email transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Đặt Lại Mật Khẩu - E-Commerce',
            html: `
                <h2>Xin chào ${user.name},</h2>
                <p>Bạn đã yêu cầu đặt lại mật khẩu. Nhấn vào link bên dưới để tiếp tục:</p>
                <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">Đặt Lại Mật Khẩu</a>
                <p>Link này sẽ hết hạn sau 15 phút.</p>
                <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: "Link đặt lại mật khẩu đã được gửi đến email của bạn" });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.json({ success: false, message: "Lỗi gửi email. Vui lòng thử lại sau." });
    }
};

// Reset Password - Set new password
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.json({ success: false, message: "Token và mật khẩu mới là bắt buộc" });
        }

        if (newPassword.length < 8) {
            return res.json({ success: false, message: "Mật khẩu phải có ít nhất 8 ký tự" });
        }

        // Hash the token from URL to compare with DB
        const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const user = await userModel.findOne({
            resetPasswordToken: resetTokenHash,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.json({ success: false, message: "Token không hợp lệ hoặc đã hết hạn" });
        }

        // Hash new password and save
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordToken = null;
        user.resetPasswordExpire = null;
        await user.save();

        res.json({ success: true, message: "Đặt lại mật khẩu thành công! Vui lòng đăng nhập." });

    } catch (error) {
        console.error("Reset Password Error:", error);
        res.json({ success: false, message: error.message });
    }
};

// Google Login - Find or create user
const googleLogin = async (req, res) => {
    try {
        const { email, name, googleId } = req.body;

        if (!email || !name || !googleId) {
            return res.json({ success: false, message: "Thông tin Google không hợp lệ" });
        }

        let user = await userModel.findOne({ email });

        if (user) {
            // Existing user - update googleId if not set
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
        } else {
            // New user from Google
            user = new userModel({
                name,
                email,
                googleId,
                password: null // No password for Google users
            });
            await user.save();
        }

        const token = createToken(user._id);
        res.json({ success: true, token });

    } catch (error) {
        console.error("Google Login Error:", error);
        res.json({ success: false, message: error.message });
    }
};

// List all users (Admin only)
const listUsers = async (req, res) => {
    try {
        const users = await userModel.find({}).select('-password -resetPasswordToken -resetPasswordExpire');
        res.json({ success: true, users });
    } catch (error) {
        console.error("List Users Error:", error);
        res.json({ success: false, message: error.message });
    }
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const user = await userModel.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, message: "Đã xóa người dùng thành công" });
    } catch (error) {
        console.error("Delete User Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- HÀM MỚI 1 ---
// Lấy ID của Admin đang đăng nhập dựa trên token (Dùng cho Admin Frontend)
const getAdminInfo = async (req, res) => {
    try {
        res.json({ success: true, adminId: req.user._id });
    } catch (error) {
        console.error("Get Admin Info Error:", error);
        res.json({ success: false, message: error.message });
    }
};

// --- HÀM MỚI 2 (ĐANG THIẾU) ---
// Lấy Profile người dùng hiện tại (Dùng cho User Frontend - Fix lỗi 404)
const getUserProfile = async (req, res) => {
    try {
        // userId được gán từ middleware authUser (auth.js)
        const { userId } = req.body; 
        const user = await userModel.findById(userId).select("-password");

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.json({ success: false, message: error.message });
    }
};

export { 
    loginUser, 
    registerUser, 
    adminLogin, 
    forgotPassword, 
    resetPassword, 
    googleLogin, 
    listUsers, 
    deleteUser,
    getAdminInfo,
    getUserProfile // Nhớ export hàm này
}