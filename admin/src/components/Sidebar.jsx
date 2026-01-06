import React from 'react';
import { NavLink } from 'react-router-dom';
import { assets } from '../assets/assets';

const Sidebar = () => {
  return (
    <div className='w-[18%] min-h-screen border-r-2'>
      <div className='flex flex-col gap-4 pt-6 pl-[20%] text-[15px]'>
        <NavLink className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l" to="/">
          <img className="w-5 h-5" src={assets.order_icon} alt="Index Icon" />
          <p className="hidden md:block">Tổng quan</p>
        </NavLink>

        <NavLink className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l" to="/add">
          <img className="w-5 h-5" src={assets.add_icon} alt="Add Icon" />
          <p className="hidden md:block">Thêm sản phẩm</p>
        </NavLink>

        <NavLink className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l" to="/list">
          <img className="w-5 h-5" src={assets.order_icon} alt="List Icon" />
          <p className="hidden md:block">Danh sách SP</p>
        </NavLink>

        <NavLink className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l" to="/orders">
          <img className="w-5 h-5" src={assets.order_icon} alt="Order Icon" />
          <p className="hidden md:block">Đơn hàng</p>
        </NavLink>

        {/* MỤC CHAT MỚI THÊM VÀO */}
        <NavLink className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l" to="/chat">
          <img className="w-5 h-5" src={assets.order_icon} alt="Chat Icon" /> 
          <p className="hidden md:block">Tin nhắn</p>
        </NavLink>

        <NavLink className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l" to="/restock">
          <img className="w-5 h-5" src={assets.add_icon} alt="Restock Icon" />
          <p className="hidden md:block">Nhập hàng</p>
        </NavLink>

        <NavLink className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l" to="/coupons">
          <img className="w-5 h-5" src={assets.order_icon} alt="Coupon Icon" />
          <p className="hidden md:block">Mã giảm giá</p>
        </NavLink>

        <NavLink className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l" to="/users">
          <img className="w-5 h-5" src={assets.order_icon} alt="Users Icon" />
          <p className="hidden md:block">Người dùng</p>
        </NavLink>

        <NavLink className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l" to="/category">
          <img className="w-5 h-5" src={assets.order_icon} alt="Category Icon" />
          <p className="hidden md:block">Danh mục</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;