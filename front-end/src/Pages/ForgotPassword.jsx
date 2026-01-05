import { useState, useContext } from 'react';
import { ShopContext } from '../Context/ShopContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const ForgotPassword = () => {
  const { backendUrl, navigate } = useContext(ShopContext);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${backendUrl}/api/user/forgot-password`, { email });
      if (response.data.success) {
        toast.success(response.data.message);
        setSent(true);
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
        <p className="prata-regular text-3xl">Quên Mật Khẩu</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {sent ? (
        <div className="text-center">
          <p className="text-green-600 mb-4">
            Nếu email tồn tại trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu trong vài phút.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-black text-white px-8 py-2"
          >
            Quay về Đăng nhập
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmitHandler} className="w-full px-3 py-2 flex flex-col gap-4">
          <p className="text-sm text-gray-500">
            Nhập email của bạn để nhận link đặt lại mật khẩu.
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300"
            placeholder="Email"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-1/2 m-auto bg-black text-white px-8 py-2 mt-4 disabled:opacity-50"
          >
            {loading ? 'Đang gửi...' : 'Gửi Link'}
          </button>
          <p
            onClick={() => navigate('/login')}
            className="text-center text-sm cursor-pointer text-gray-500 hover:text-black"
          >
            Quay về Đăng nhập
          </p>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
