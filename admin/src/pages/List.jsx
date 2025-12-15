import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl, currency } from '../App';

const List = ({token}) => {
  const [list, setList] = useState([]);

  const fetchList = async () => {
    try {
      const response = await axios.get(`${backendUrl}/admin/product`, { headers: { token } });
      if(response.data.err === 0) {
        setList(response.data.response || []);
      }
      else {
        toast.error(response.data.msg || 'Tải sản phẩm thất bại');
      }
      
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const removeProduct = async (id) => {
    toast.warn('Chức năng xóa sản phẩm chưa được hỗ trợ ở backend hiện tại.');
  }

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <>
      <p className='mb-2'>Danh sách tất cả sản phẩm</p>
      <div className='flex flex-col gap-2'>
        <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
          <b>Ảnh</b>
          <b>Tên</b>
          <b>Danh mục</b>
          <b>Giá</b>
          <b className='text-center'>Thao tác</b>
        </div>
        {
          list.map((item, index) =>(
            <div className='grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm' key={index}>
              <img src={item.images?.[0]?.imageUrl || item.image?.[0] || ''} alt=""/>
              <p>{item.name}</p>
              <p>{item.category?.header || item.category}</p>
              <p>{currency}{item.price}</p>
              <p onClick={()=>removeProduct(item._id)} className='text-right md:text-center cursor-pointer text-lg opacity-50' title="Chưa hỗ trợ">X</p>
            </div>
          ))
        }
      </div>
    </>
  );
};

export default List;
