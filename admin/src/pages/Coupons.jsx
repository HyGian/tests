import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl } from '../App';

const Coupons = ({ token }) => {
  const [coupons, setCoupons] = useState([]);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percent',
    discountValue: '',
    minPurchase: '',
    expiryDate: '',
    usageLimit: ''
  });

  const fetchCoupons = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/coupon/list', {
        headers: { token }
      });
      if (response.data.success) {
        setCoupons(response.data.coupons);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCoupons();
    }
  }, [token]);

  const onChangeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(backendUrl + '/api/coupon/add', formData, {
        headers: { token }
      });
      if (response.data.success) {
        toast.success(response.data.message);
        setFormData({
          code: '',
          discountType: 'percent',
          discountValue: '',
          minPurchase: '',
          expiryDate: '',
          usageLimit: ''
        });
        fetchCoupons();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const deleteCoupon = async (couponId) => {
    if (!window.confirm('Bạn có chắc muốn xóa mã này?')) return;
    try {
      const response = await axios.post(backendUrl + '/api/coupon/delete', { couponId }, {
        headers: { token }
      });
      if (response.data.success) {
        toast.success(response.data.message);
        fetchCoupons();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const toggleCoupon = async (couponId) => {
    try {
      const response = await axios.post(backendUrl + '/api/coupon/toggle', { couponId }, {
        headers: { token }
      });
      if (response.data.success) {
        toast.success(response.data.message);
        fetchCoupons();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  return (
    <div className='w-full'>
      <h3 className="mb-5 text-2xl font-semibold">Quản lý mã giảm giá</h3>

      {/* Add Coupon Form */}
      <form onSubmit={onSubmitHandler} className='bg-white p-6 rounded-lg shadow-md mb-8'>
        <h4 className="text-lg font-medium mb-4">Thêm mã mới</h4>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>Mã giảm giá</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={onChangeHandler}
              placeholder="VD: SALE20"
              className='w-full px-3 py-2 border rounded'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Loại giảm</label>
            <select
              name="discountType"
              value={formData.discountType}
              onChange={onChangeHandler}
              className='w-full px-3 py-2 border rounded'
            >
              <option value="percent">Phần trăm (%)</option>
              <option value="fixed">Số tiền cố định (₫)</option>
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>
              Giá trị {formData.discountType === 'percent' ? '(%)' : '(₫)'}
            </label>
            <input
              type="number"
              name="discountValue"
              value={formData.discountValue}
              onChange={onChangeHandler}
              placeholder={formData.discountType === 'percent' ? 'VD: 20' : 'VD: 50000'}
              className='w-full px-3 py-2 border rounded'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Đơn tối thiểu (₫)</label>
            <input
              type="number"
              name="minPurchase"
              value={formData.minPurchase}
              onChange={onChangeHandler}
              placeholder="VD: 200000"
              className='w-full px-3 py-2 border rounded'
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Ngày hết hạn</label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={onChangeHandler}
              className='w-full px-3 py-2 border rounded'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Giới hạn lượt dùng</label>
            <input
              type="number"
              name="usageLimit"
              value={formData.usageLimit}
              onChange={onChangeHandler}
              placeholder="Để trống = không giới hạn"
              className='w-full px-3 py-2 border rounded'
            />
          </div>
        </div>
        <button type='submit' className='mt-4 bg-black text-white px-6 py-2 rounded hover:bg-gray-800'>
          THÊM MÃ
        </button>
      </form>

      {/* Coupons List */}
      <div className='bg-white rounded-lg shadow-md overflow-hidden'>
        <table className='w-full text-sm'>
          <thead className='bg-gray-100'>
            <tr>
              <th className='px-4 py-3 text-left'>Mã</th>
              <th className='px-4 py-3 text-left'>Loại</th>
              <th className='px-4 py-3 text-left'>Giá trị</th>
              <th className='px-4 py-3 text-left'>Đơn tối thiểu</th>
              <th className='px-4 py-3 text-left'>Hết hạn</th>
              <th className='px-4 py-3 text-left'>Đã dùng</th>
              <th className='px-4 py-3 text-left'>Trạng thái</th>
              <th className='px-4 py-3 text-left'>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td colSpan="8" className='px-4 py-6 text-center text-gray-500'>
                  Chưa có mã giảm giá nào
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon._id} className='border-t hover:bg-gray-50'>
                  <td className='px-4 py-3 font-mono font-bold'>{coupon.code}</td>
                  <td className='px-4 py-3'>
                    {coupon.discountType === 'percent' ? 'Phần trăm' : 'Cố định'}
                  </td>
                  <td className='px-4 py-3'>
                    {coupon.discountType === 'percent' 
                      ? `${coupon.discountValue}%` 
                      : `${coupon.discountValue.toLocaleString()}₫`}
                  </td>
                  <td className='px-4 py-3'>{coupon.minPurchase.toLocaleString()}₫</td>
                  <td className='px-4 py-3'>{formatDate(coupon.expiryDate)}</td>
                  <td className='px-4 py-3'>
                    {coupon.usedCount}/{coupon.usageLimit || '∞'}
                  </td>
                  <td className='px-4 py-3'>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      coupon.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {coupon.isActive ? 'Hoạt động' : 'Tắt'}
                    </span>
                  </td>
                  <td className='px-4 py-3'>
                    <button
                      onClick={() => toggleCoupon(coupon._id)}
                      className={`px-2 py-1 mr-2 text-xs rounded ${
                        coupon.isActive 
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {coupon.isActive ? 'Tắt' : 'Bật'}
                    </button>
                    <button
                      onClick={() => deleteCoupon(coupon._id)}
                      className='px-2 py-1 text-xs rounded bg-red-100 text-red-800 hover:bg-red-200'
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Coupons;
