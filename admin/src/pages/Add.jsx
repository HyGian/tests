import React from 'react';
import { assets } from '../assets/assets';
import { useState } from 'react';
import axios from "axios"
import {backendUrl} from "../App"
import { toast } from 'react-toastify';

const Add = ({token}) => {

  const [imageUrl, setImageUrl] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [bestseller, setBestseller] = useState(false);

  useEffect(() => {
      const fetchCategories = async () => {
          try {
              const response = await axios.get(`${backendUrl}/category/all`);
              if (response.data.err === 0) {
                  setCategories(response.data.response || []);
                  if (response.data.response && response.data.response.length > 0) {
                      setCategory(response.data.response[0]._id);
                  }
              }
          } catch (error) {
              console.log(error);
              toast.error("Không thể tải danh mục");
          }
      };
      fetchCategories();
  }, []);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
        const payload = {
            productName: name,
            productDescription: description,
            productPrice: Number(price),
            productCategoryId: category,
            productimageUrl: imageUrl,
            productColorUrl: imageUrl, // Using same image for now
            productInformation: "Sẵn có",
            productColor: "General",
            productVersion: "v1"
        };

        const response = await axios.post(`${backendUrl}/product/create/productId`, payload, { headers: { Authorization: `Bearer ${token}` } });
        
        if (response.data.err === 0) {
            toast.success(response.data.msg);
            setName("");
            setDescription("");
            setPrice("");
            setImageUrl("");
            setSizes([]);
            setBestseller(false);
        } else {
            toast.error(response.data.msg);
        }

    } catch (error) {
        console.log(error);
        toast.error(error.message);
    }
  };
  
  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
      <div className='w-full'>
        <p className='mb-2'>URL Hình ảnh sản phẩm</p>
        <input onChange={(e)=>setImageUrl(e.target.value)} value={imageUrl} className='w-full max-w-[500px] px-3 py-2 border' type='text' placeholder='https://example.com/image.jpg' required />
        {imageUrl && <img src={imageUrl} alt="Preview" className="w-20 h-20 object-cover mt-2" />}
      </div>

      <div className='w-full'>
        <p className='mb-2'>Tên sản phẩm</p>
        <input onChange={(e)=>setName(e.target.value)} value={name} className='w-full max-w-[500px] px-3 py-2' type='text' placeholder='Nhập tại đây' required />
      </div>

      <div className='w-full'>
        <p className='mb-2'>Mô tả sản phẩm</p>
        <textarea onChange={(e)=>setDescription(e.target.value)} value={description} className='w-full max-w-[500px] px-3 py-2' type='text' placeholder='Viết nội dung tại đây' required />
      </div>

      <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
        <div className="w-full sm:w-1/2">
            <p className='mb-2'>Danh mục sản phẩm</p>
            <select onChange={(e)=>setCategory(e.target.value)} value={category} className='w-full px-3 py-2'>
            {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.header}</option>
            ))}
            </select>
        </div>
        <div className="w-full sm:w-1/2">
            <p className='mb-2'>Giá sản phẩm</p>
            <input onChange={(e)=>setPrice(e.target.value)} value={price} className='w-full px-3 py-2' type='Number' placeholder='25' required />
        </div>
      </div>

      <div>
        <p className='mb-2'>Kích cỡ sản phẩm (Chỉ để hiển thị, chưa lưu DB)</p>
        <div className='flex gap-3'>
            {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                 <div key={size} onClick={()=>setSizes(prev => prev.includes(size) ? prev.filter( item => item !== size):[...prev,size])}>
                 <p className={`${sizes.includes(size) ? "bg-pink-100":"bg-slate-200"} px-3 py-1 cursor-pointer`}>{size}</p>
               </div>
            ))}
        </div>
      </div>

      <div className='flex gap-2 mt-2'>
        <input onChange={()=>setBestseller(prev => !prev)} checked={bestseller} type='checkbox' id='bestseller' />
        <label className='cursor-pointer' htmlFor="bestseller">Thêm vào danh sách bán chạy</label>
      </div>

      <button type='submit' className='w-28 py-3 mt-4 bg-black text-white '>Thêm</button>
    </form>
  );
};

export default Add;
