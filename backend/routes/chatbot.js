
import express from 'express';
import { chatWithAI } from '../controllers/chatbot.js';
import authMiddleware from '../middleware/auth.js';

const chatbotRouter = express.Router();

// Using authMiddleware to get userId for personalized answers (e.g. order status)
chatbotRouter.post('/ask', authMiddleware, chatWithAI);

export default chatbotRouter;
