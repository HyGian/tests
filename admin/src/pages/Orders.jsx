import React from 'react'
import {useEffect, useState} from 'react'
import axios from 'axios'
import {backendUrl, currency} from '../App.jsx'
import {toast} from 'react-toastify'
import { assets } from '../assets/assets.js'

const Orders = ({token}) => {
  const [orders, setOrders] = useState([])
  
  const fetchAllOrders = async () => {
    if(!token) {
      return null;
    }
    try {
      const response = await axios.get(`${backendUrl}/admin/orders`, {headers:{token}})
      if (response.data.err === 0){
        setOrders(response.data.response || [])
      } else {
        toast.error(response.data.msg || 'Tải đơn hàng thất bại')
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const statusHandler = async (event, orderId) => {
    toast.warn('Cập nhật trạng thái chưa được backend hỗ trợ.');
  };
  

  useEffect(() => {
    fetchAllOrders()
  }, [token])

  return (
    <div>
      <h3>Trang đơn hàng</h3>
      <div>
        {orders.map((order, index) => (
          <div className='grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700' key={index}>
            <img className='w-12' src={assets.parcel_icon} alt="" />
            <div>
            <div>
              {order.items?.map((item, index) => {
                if(index === order.items.length - 1) {
                  return <p className='py-0.5' key={index}>{(item.productName || item.product?.name)}x{item.quantity} <span>{item.size}</span></p>
                }
                else {
                  return <p className='py-0.5' key={index}>{(item.productName || item.product?.name)}x{item.quantity} <span>{item.size}</span>,</p>
                }
              })}
            </div>
            <p className='mt-3 mb-2 font-medium'>{order.shippingAddress?.fullName || 'N/A'}</p>
            <div>
              <p>{order.shippingAddress?.addressLine1}</p>
              <p>{order.shippingAddress?.city}</p>
            </div>
            <p>{order.shippingAddress?.phoneNumber}</p>
          </div>
          <div>
            <p className='text-sm sm:text-[15px]'>Sản phẩm: {order.items?.length || 0}</p>
            <p className='mt-3'>Trạng thái: {order.status}</p>
            <p>Thanh toán: {order.status === 'Order Successful' ? 'Đã thanh toán' : 'Chưa thanh toán'}</p>
            <p>Ngày: {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <p className='text-sm sm:text-[15px]'>{currency}{order.totalAmount}</p>
          <select onChange={(event)=>statusHandler(event,order._id)} value={order.status} className='p-2 font-semibold' disabled>
            <option value={order.status}>{order.status}</option>
          </select>
            </div>
        ))}
      </div>
    </div>
  )
}

export default Orders
