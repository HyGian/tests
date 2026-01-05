import chatModel from '../models/chat.js';

const chatSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('Thiết bị kết nối Chat:', socket.id);

        // Tham gia phòng chat riêng 
        socket.on('join_chat', ({ senderId, receiverId }) => {
            // Sắp xếp ID để A_B hay B_A 
            const roomId = [senderId, receiverId].sort().join("_");
            socket.join(roomId);
            console.log(`User vào phòng: ${roomId}`);
        });

        // Xử lý gửi tin nhắn 
        socket.on('send_private_message', async (data) => {
            const { senderId, receiverId, message } = data;
            const roomId = [senderId, receiverId].sort().join("_");

            try {
                // Lưu tin nhắn vào MongoDB
                const newChat = new chatModel({
                    participants: [senderId, receiverId],
                    senderId,
                    receiverId,
                    message
                });
                await newChat.save();
                // Phát tín hiệu 
                io.to(roomId).emit('receive_private_message', {
                    senderId,
                    message,
                    timestamp: newChat.timestamp
                });
            } catch (error) {
                console.error("Lỗi socket chat:", error);
            }
        });

        socket.on('disconnect', () => {
            console.log('User ngắt kết nối');
        });
    });
};

export default chatSocket;