import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

// Giả sử bạn để backendUrl trong file App hoặc một file config
const backendUrl = import.meta.env.VITE_BACKEND_URL; 

const Chat = ({ token }) => {
    const [partners, setPartners] = useState([]); 
    const [currentChat, setCurrentChat] = useState(null); 
    const [messages, setMessages] = useState([]); 
    const [newMessage, setNewMessage] = useState("");
    const [adminId, setAdminId] = useState(""); 
    
    const socket = useRef();
    const scrollRef = useRef();

    // 1. Khởi tạo và kết nối Socket
    useEffect(() => {
        if (token) {
            // Kết nối socket
            socket.current = io(backendUrl);

            // Lấy profile admin để biết ID của mình
            const getAdminProfile = async () => {
                try {
                    const response = await axios.get(backendUrl + '/api/user/admin-info', { headers: { token } });
                    if (response.data.success) {
                        setAdminId(response.data.adminId);
                    }
                } catch (error) {
                    console.error("Lỗi lấy ID admin:", error);
                }
            };
            getAdminProfile();

            // Lắng nghe tin nhắn Real-time
            socket.current.on('receive_private_message', (data) => {
                setMessages((prev) => [...prev, data]);
            });

            return () => socket.current.disconnect();
        }
    }, [token]);

    // 2. Lấy danh sách khách hàng đã từng chat
    const fetchPartners = async () => {
        if (!adminId) return;
        try {
            const response = await axios.get(`${backendUrl}/api/chat/partners/${adminId}`, { headers: { token } });
            if (response.data.success) {
                setPartners(response.data.chats);
            }
        } catch (error) {
            toast.error("Không thể lấy danh sách chat");
        }
    };

    useEffect(() => {
        fetchPartners();
    }, [adminId]);

    // 3. Chọn một khách hàng để xem nội dung chat
    const selectChat = async (partner) => {
        setCurrentChat(partner);
        // Vào phòng chat riêng biệt
        socket.current.emit('join_chat', { senderId: adminId, receiverId: partner.userId });
        
        try {
            const response = await axios.get(`${backendUrl}/api/chat/messages/${adminId}/${partner.userId}`, { headers: { token } });
            if (response.data.success) {
                setMessages(response.data.messages);
            }
            // Đánh dấu đã đọc khi mở chat (tùy chọn)
        } catch (error) {
            console.log(error);
        }
    };

    // 4. Gửi tin nhắn đi
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentChat) return;

        const chatData = {
            senderId: adminId,
            receiverId: currentChat.userId,
            message: newMessage
        };

        // Gửi qua socket để bên kia nhận ngay
        socket.current.emit('send_private_message', chatData);
        setNewMessage("");
    };

    // Tự động cuộn xuống khi có tin nhắn mới
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className='flex h-[80vh] border rounded-lg overflow-hidden bg-white shadow-sm'>
            {/* Danh sách User bên trái */}
            <div className='w-1/3 border-r overflow-y-auto bg-gray-50'>
                <div className='p-4 font-bold border-b bg-white'>Khách hàng liên hệ</div>
                {partners.length > 0 ? partners.map((item) => (
                    <div 
                        key={item.userId} 
                        onClick={() => selectChat(item)}
                        className={`p-4 flex items-center gap-3 cursor-pointer border-b transition-all ${currentChat?.userId === item.userId ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                    >
                        <img className='w-10 h-10 rounded-full' src={item.avatar || 'https://via.placeholder.com/40'} alt="" />
                        <div className='flex-1 min-w-0'>
                            <p className='font-semibold text-sm truncate'>{item.name}</p>
                            <p className='text-xs text-gray-500 truncate'>{item.lastMessage}</p>
                        </div>
                        {item.unreadCount > 0 && (
                            <div className='bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center'>
                                {item.unreadCount}
                            </div>
                        )}
                    </div>
                )) : (
                    <p className='p-4 text-center text-gray-400 text-sm'>Chưa có cuộc hội thoại nào</p>
                )}
            </div>

            {/* Khung chat bên phải */}
            <div className='flex-1 flex flex-col'>
                {currentChat ? (
                    <>
                        <div className='p-4 border-b flex items-center gap-3 bg-white'>
                            <img className='w-8 h-8 rounded-full' src={currentChat.avatar || 'https://via.placeholder.com/30'} alt="" />
                            <p className='font-bold'>{currentChat.name}</p>
                        </div>

                        <div className='flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50'>
                            {messages.map((msg, index) => (
                                <div 
                                    key={index} 
                                    ref={scrollRef}
                                    className={`flex ${msg.senderId === adminId ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-sm ${msg.senderId === adminId ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none'}`}>
                                        {msg.message}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={sendMessage} className='p-4 border-t bg-white flex gap-2'>
                            <input 
                                className='flex-1 border border-gray-300 rounded-full px-4 py-2 outline-none focus:ring-1 focus:ring-blue-500'
                                type="text" 
                                placeholder="Nhập tin nhắn..."
                                value={newMessage}
                                onChange={(e)=>setNewMessage(e.target.value)}
                            />
                            <button type="submit" className='bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 active:scale-95 transition-all font-medium'>Gửi</button>
                        </form>
                    </>
                ) : (
                    <div className='flex-1 flex flex-col items-center justify-center text-gray-400'>
                        <img className='w-20 opacity-20 mb-2' src={assets.order_icon} alt="" />
                        <p>Chọn một khách hàng để bắt đầu tư vấn</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;