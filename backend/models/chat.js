import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    // Danh sách ID 
    participants: [{ type: String, required: true }], 
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

// Đánh index tìm kiếm lịch sử chat
chatSchema.index({ participants: 1 });

const chatModel = mongoose.models.chat || mongoose.model("chat", chatSchema);
export default chatModel;