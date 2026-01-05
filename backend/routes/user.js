import express from "express";
import { loginUser, registerUser, adminLogin, forgotPassword, resetPassword, googleLogin, listUsers, deleteUser } from "../controllers/user.js";
import adminAuth from "../middleware/adminAuth.js";

const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/admin', adminLogin)
userRouter.post('/forgot-password', forgotPassword)
userRouter.post('/reset-password', resetPassword)
userRouter.post('/google-login', googleLogin)
userRouter.get('/list', adminAuth, listUsers)
userRouter.post('/delete', adminAuth, deleteUser)

export default userRouter;