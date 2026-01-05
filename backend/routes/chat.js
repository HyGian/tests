import express from 'express';
import {getMessages, getChatPartners, markAsRead } from '../controllers/chat.js';
import authUser from '../middleware/auth.js';

const chatRouter = express.Router();

// Lấy tin nhắn giữa 2 người
chatRouter.get('/messages/:user1Id/:user2Id', authUser, getMessages);
// Lấy danh sách người đã chat với
chatRouter.get('/partners/:userId', authUser, getChatPartners);
// Đánh dấu đã đọc
chatRouter.put('/read/:messageId', authUser, markAsRead);

export default chatRouter;