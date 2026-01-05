import { useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../Context/ShopContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const ResetPassword = () => {
  const { token } = useParams();
  const { backendUrl, navigate } = useContext(ShopContext);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Mật khẩu phải có ít nhất 8 ký tự!');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${backendUrl}/api/user/reset-password`, {
        token,
        newPassword
      });

      if (response.data.success) {
        toast.success(response.data.message);
        navigate('/login');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800">
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">Đặt Lại Mật Khẩu</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      <form onSubmit={onSubmitHandler} className="w-full px-3 py-2 flex flex-col gap-4">
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300"
          placeholder="Mật khẩu mới"
          required
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300"
          placeholder="Xác nhận mật khẩu mới"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-1/2 m-auto bg-black text-white px-8 py-2 mt-4 disabled:opacity-50"
        >
          {loading ? 'Đang xử lý...' : 'Đặt Lại Mật Khẩu'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
