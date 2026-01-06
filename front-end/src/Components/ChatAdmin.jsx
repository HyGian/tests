import React, { useContext, useEffect, useState, useRef } from 'react';
import { ShopContext } from '../Context/ShopContext';
import axios from 'axios';
import { assets } from '../assets/assets';

const ChatAdmin = () => {
    const { token, backendUrl, userData, socket } = useContext(ShopContext);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [adminId, setAdminId] = useState(null);
    const scrollRef = useRef();

    // 1. Lấy thông tin Admin ID (vì user chỉ chat với admin)
    useEffect(() => {
        const getAdminData = async () => {
            if (!token || !userData) return;
            try {
                const res = await axios.get(`${backendUrl}/api/chat/partners/${userData._id}`, { headers: { token } });
                if (res.data.success && res.data.chats.length > 0) {
                    setAdminId(res.data.chats[0].userId);
                }
            } catch (error) {
                console.log("Không tìm thấy Admin");
            }
        };
        getAdminData();
    }, [token, userData]);

    // 2. Lắng nghe socket
    useEffect(() => {
        if (socket && isOpen) {
            socket.on('receive_private_message', (data) => {
                setMessages((prev) => [...prev, data]);
            });
            return () => socket.off('receive_private_message');
        }
    }, [socket, isOpen]);

    // 3. Lấy lịch sử khi mở khung chat
    const toggleChat = async () => {
        setIsOpen(!isOpen);
        if (!isOpen && adminId && userData) {
            socket.emit('join_chat', { senderId: userData._id, receiverId: adminId });
            const res = await axios.get(`${backendUrl}/api/chat/messages/${userData._id}/${adminId}`, { headers: { token } });
            if (res.data.success) setMessages(res.data.messages);
        }
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim() || !adminId) return;
        
        const msgData = { senderId: userData._id, receiverId: adminId, message: input };
        socket.emit('send_private_message', msgData);
        setInput("");
    };

    useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    if (!token) return null;

    return (
        <div className="fixed bottom-24 right-6 z-50"> {/* Đặt bottom-24 để nằm trên ChatWidget AI thường ở bottom-6 */}
            {/* Nút bấm */}
            <button 
                onClick={toggleChat}
                className="bg-black text-white p-3 rounded-full shadow-lg hover:scale-110 transition-all"
            >
                <img src={assets.support_img} className="w-6 h-6 invert" alt="Chat Admin" />
            </button>

            {/* Khung Chat */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-80 h-96 bg-white border shadow-2xl rounded-lg flex flex-col">
                    <div className="p-3 bg-black text-white rounded-t-lg flex justify-between">
                        <span className="text-sm font-bold">Hỗ trợ trực tuyến</span>
                        <button onClick={() => setIsOpen(false)}>×</button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
                        {messages.map((m, i) => (
                            <div key={i} ref={scrollRef} className={`flex ${m.senderId === userData._id ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-2 rounded-lg text-xs ${m.senderId === userData._id ? 'bg-black text-white' : 'bg-gray-200 text-black'}`}>
                                    {m.message}
                                </div>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSend} className="p-2 border-t flex gap-1">
                        <input 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 text-xs border p-2 rounded outline-none" 
                            placeholder="Nhập tin nhắn..." 
                        />
                        <button type="submit" className="bg-black text-white px-3 py-1 rounded text-xs">Gửi</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatAdmin;