import chatModel from '../models/chat.js'; 

const chatSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('Thiết bị kết nối Chat:', socket.id);

        socket.on('join_chat', ({ senderId, receiverId }) => {
            if (!senderId || !receiverId) return;

        
            const roomId = [senderId, receiverId].sort().join("_");
            socket.join(roomId);
            
            console.log(`User ${senderId} đã vào phòng chat: ${roomId}`);
        });

       
        socket.on('send_private_message', async (data) => {
            const { senderId, receiverId, message } = data;

            if (!senderId || !receiverId || !message) return;

         
            const roomId = [senderId, receiverId].sort().join("_");

            try {
             
                const newChat = new chatModel({
                    participants: [senderId, receiverId],
                    senderId,
                    receiverId,
                    message,
                    read: false 
                });

                
                const savedChat = await newChat.save();

               
                io.to(roomId).emit('receive_private_message', savedChat);

                console.log(`Tin nhắn từ ${senderId} tới ${receiverId} đã được gửi thành công.`);

            } catch (error) {
                console.error("Lỗi khi lưu hoặc gửi tin nhắn socket:", error);
                socket.emit('chat_error', { message: "Không thể gửi tin nhắn" });
            }
        });

       
        socket.on('typing', ({ senderId, receiverId, userName }) => {
             const roomId = [senderId, receiverId].sort().join("_");
             socket.to(roomId).emit('user_typing', { userName });
        });

        socket.on('disconnect', () => {
            console.log('Một thiết bị đã ngắt kết nối chat');
        });
    });
};

export default chatSocket;