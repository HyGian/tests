import chatModel from "../models/chat.js";

export const getMessages = async (req, res) => {
    try {
        const { user1Id, user2Id } = req.params;

        const messages = await chatModel.find({
            $or: [
                { user1: user1Id, user2: user2Id },
                { user1: user2Id, user2: user1Id }
            ]
        }).sort({ timestamp: 1 }); 

        res.json({ 
            success: true, 
            messages 
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Lấy danh sách người đã chat
export const getChatPartners = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Tìm tất cả người đã chat với user này
        const chats = await chatModel.aggregate([
            {
                $match: {
                    $or: [
                        { user1: userId },
                        { user2: userId }
                    ]
                }
            },
            {
                $sort: { timestamp: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$user1", userId] },
                            "$user2",
                            "$user1"
                        ]
                    },
                    lastMessage: { $first: "$message" },
                    lastMessageTime: { $first: "$timestamp" },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                { 
                                    $and: [
                                        { $eq: ["$receiver", userId] },
                                        { $eq: ["$read", false] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            {
                $unwind: '$userInfo'
            },
            {
                $project: {
                    userId: '$_id',
                    name: '$userInfo.name',
                    email: '$userInfo.email',
                    avatar: '$userInfo.avatar',
                    lastMessage: 1,
                    lastMessageTime: 1,
                    unreadCount: 1
                }
            },
            {
                $sort: { lastMessageTime: -1 }
            }
        ]);

        res.json({ success: true, chats });
    } catch (error) {
        console.error('Get chat partners error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Đánh dấu tin nhắn đã đọc
export const markAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;
        
        await chatModel.findByIdAndUpdate(messageId, {
            read: true,
            readAt: new Date()
        });

        res.json({ success: true, message: 'Marked as read' });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};