import chatModel from "../models/chat.js";
import userModel from "../models/user.js";
import mongoose from "mongoose";

// 1. Lấy lịch sử tin nhắn giữa 2 người
export const getMessages = async (req, res) => {
    try {
        const { user1Id, user2Id } = req.params;

        // Tìm tin nhắn mà mảng participants chứa cả 2 ID này
        const messages = await chatModel.find({
            participants: { $all: [user1Id, user2Id] }
        }).sort({ createdAt: 1 }); 

        res.json({ success: true, messages });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Lấy danh sách đối tác chat (Phân quyền Admin/User)
export const getChatPartners = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUser = await userModel.findById(userId);

        if (!currentUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (currentUser.role === 'admin') {
            // --- KỊCH BẢN CHO ADMIN: Lấy tất cả khách hàng đã nhắn tin ---
            const chats = await chatModel.aggregate([
                { $match: { participants: userId } },
                { $sort: { createdAt: -1 } },
                {
                    $group: {
                        _id: { $cond: [{ $eq: ["$senderId", userId] }, "$receiverId", "$senderId"] },
                        lastMessage: { $first: "$message" },
                        lastMessageTime: { $first: "$createdAt" },
                        unreadCount: {
                            $sum: { 
                                $cond: [{ $and: [{ $eq: ["$receiverId", userId] }, { $eq: ["$read", false] }] }, 1, 0] 
                            }
                        }
                    }
                },
                // Chuyển đổi ID từ String sang ObjectId để Lookup chính xác
                {
                    $addFields: {
                        partnerObjectId: { $toObjectId: "$_id" }
                    }
                },
                {
                    $lookup: {
                        from: 'users', // Đảm bảo tên collection trong MongoDB Atlas là 'users'
                        localField: 'partnerObjectId',
                        foreignField: '_id',
                        as: 'userInfo'
                    }
                },
                { $unwind: '$userInfo' },
                {
                    $project: {
                        userId: '$_id',
                        name: '$userInfo.name',
                        avatar: '$userInfo.avatar',
                        lastMessage: 1,
                        lastMessageTime: 1,
                        unreadCount: 1
                    }
                },
                { $sort: { lastMessageTime: -1 } }
            ]);
            return res.json({ success: true, chats });

        } else {
            // --- KỊCH BẢN CHO USER: Chỉ lấy thông tin Admin ---
            const admin = await userModel.findOne({ role: 'admin' }).select('name avatar');
            if (!admin) return res.json({ success: true, chats: [] });

            const lastChat = await chatModel.findOne({
                participants: { $all: [userId, admin._id.toString()] }
            }).sort({ createdAt: -1 });

            return res.json({ 
                success: true, 
                chats: [{
                    userId: admin._id,
                    name: "Hỗ trợ khách hàng (Admin)",
                    avatar: admin.avatar,
                    lastMessage: lastChat ? lastChat.message : "Bắt đầu trò chuyện",
                    lastMessageTime: lastChat ? lastChat.createdAt : null,
                    unreadCount: 0 
                }] 
            });
        }
    } catch (error) {
        console.error('Get chat partners error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Đánh dấu đã đọc
export const markAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;
        await chatModel.findByIdAndUpdate(messageId, { read: true, readAt: new Date() });
        res.json({ success: true, message: 'Marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};