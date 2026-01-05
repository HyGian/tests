
import React, { useState, useRef, useEffect, useContext } from 'react';
import { assets } from '../assets/assets';
import { ShopContext } from '../Context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Xin chào! Mình là trợ lý ảo AI. Mình có thể giúp gì cho bạn? (Tìm sản phẩm, check đơn hàng...)", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const { backendUrl, token, navigate } = useContext(ShopContext);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        // Optimistic UI update or wait for response? Wait is better for AI.
        
        let headers = {};
        if (token) {
            headers = { token };
        }

        const response = await axios.post(backendUrl + '/api/chatbot/ask', {
            question: input,
            userId: token ? 'param_ignored_middleware_handles_it' : null // Middleware gets ID from token
        }, { headers });

        if (response.data.success) {
            const botMessage = { text: response.data.response, sender: 'bot' };
            setMessages(prev => [...prev, botMessage]);
        } else {
            setMessages(prev => [...prev, { text: "Xin lỗi, mình gặp chút sự cố. Bạn thử lại sau nhé!", sender: 'bot' }]);
        }

    } catch (error) {
        console.error(error);
        if (error.response && error.response.status === 401) {
             setMessages(prev => [...prev, { text: "Bạn cần đăng nhập để mình kiểm tra thông tin cá nhân (như đơn hàng) nhé!", sender: 'bot' }]);
             // Optionally redirect to login or show link
        } else {
             setMessages(prev => [...prev, { text: "Hệ thống đang bảo trì, bạn quay lại sau nhé.", sender: 'bot' }]);
        }
    } finally {
        setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white border rounded-lg shadow-xl w-80 sm:w-96 mb-4 flex flex-col overflow-hidden transition-all duration-300 ease-in-out h-[500px]">
          {/* Header */}
          <div className="bg-gray-800 text-white p-3 flex justify-between items-center rounded-t-lg">
            <div className="flex items-center gap-2">
                <img src={assets.support_img} alt="Bot" className="w-8 h-8 rounded-full bg-white p-1" />
                <span className="font-semibold">Trợ lý AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white text-xl">&times;</button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
             {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                        msg.sender === 'user' 
                        ? 'bg-gray-800 text-white rounded-br-none' 
                        : 'bg-white border shadow-sm text-gray-800 rounded-bl-none'
                    }`}>
                        <p className="whitespace-pre-line">{msg.text}</p>
                    </div>
                </div>
             ))}
             {isLoading && (
                 <div className="flex justify-start">
                     <div className="bg-white border shadow-sm p-3 rounded-lg rounded-bl-none">
                         <div className="flex gap-1">
                             <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                             <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                             <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                         </div>
                     </div>
                 </div>
             )}
             <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t flex gap-2">
            <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Hỏi gì đó..." 
                className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-gray-800"
            />
            <button 
                onClick={handleSend}
                disabled={isLoading}
                className="bg-gray-800 text-white p-2 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-700 disabled:bg-gray-400"
            >
                <img src={assets.dropdown_icon} className="h-4 w-4 -rotate-90 filter invert" alt="Send"/>
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button 
            onClick={() => setIsOpen(true)}
            className="bg-gray-800 text-white p-4 rounded-full shadow-lg hover:bg-gray-700 transition-transform hover:scale-110 flex items-center gap-2 group"
        >
            <img src={assets.support_img} alt="Chat" className="w-6 h-6 filter invert" />
            <span className="hidden group-hover:block font-medium pr-2 transition-all">Chat với AI</span>
        </button>
      )}
    </div>
  );
};

export default ChatWidget;
