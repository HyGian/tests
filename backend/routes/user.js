import express from "express";
// Import các hàm từ controller
import { 
    loginUser, 
    registerUser, 
    adminLogin, 
    forgotPassword, 
    resetPassword, 
    googleLogin, 
    listUsers, 
    deleteUser,
    getAdminInfo,
    getUserProfile // Đảm bảo đã thêm hàm này vào đây
} from "../controllers/user.js";

// IMPORT CÁC MIDDLEWARE
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js"; // <--- ĐÂY LÀ DÒNG BẠN ĐANG THIẾU

const userRouter = express.Router();

// Routes công khai
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/admin', adminLogin);
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password', resetPassword);
userRouter.post('/google-login', googleLogin);

// Routes dành cho Admin (Bảo vệ bởi adminAuth)
userRouter.get('/list', adminAuth, listUsers);
userRouter.post('/delete', adminAuth, deleteUser);
userRouter.get('/admin-info', adminAuth, getAdminInfo);

// Route dành cho User thường (Bảo vệ bởi authUser)
userRouter.get('/profile', authUser, getUserProfile); 

export default userRouter;