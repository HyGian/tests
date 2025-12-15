import axios from 'axios';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { backendUrl } from '../App.jsx';

const Login = ({setToken}) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      const response = await axios.post(`${backendUrl}/admin/login`, { phone, password });
      if (response.data.err === 0) {
        setToken(response.data.token);
      }
      else {
        toast.error(response.data.msg || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center w-full bg-gray-100">
      <div className="bg-white shadow-md rounded-lg px-8 py-6 w-80">
        <h1 className="text-2xl font-bold mb-4 text-center">Trang quản trị</h1>
        <form onSubmit={onSubmitHandler}>
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Số điện thoại</p>
            <input 
              onChange={(e) => setPhone(e.target.value)} 
              value={phone} 
              className="rounded-md w-full px-3 py-2 border border-gray-300 outline-none focus:ring-2 focus:ring-black" 
              type="tel" 
              placeholder="09xxxxxxxx" 
              required 
            />
          </div>
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Mật khẩu</p>
            <input 
              onChange={(e) => setPassword(e.target.value)} 
              value={password} 
              className="rounded-md w-full px-3 py-2 border border-gray-300 outline-none focus:ring-2 focus:ring-black" 
              type="password" 
              placeholder="Nhập mật khẩu" 
              required 
            />
          </div>
          <button 
            className="mt-2 w-full py-2 px-4 rounded-md text-white bg-black hover:bg-gray-800 transition"
            type="submit"
          >
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
