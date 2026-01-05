
import { useContext, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { ShopContext } from '../Context/ShopContext';
import { toast } from 'react-toastify';

const Verify = () => {
  const { navigate, token, setCartItems, backendUrl } = useContext(ShopContext);
  const [searchParams] = useSearchParams();

  const success = searchParams.get('success');
  const orderId = searchParams.get('orderId');

  // VNPay returns parameters
  const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
  const vnp_TxnRef = searchParams.get('vnp_TxnRef');

  const verifyPayment = async () => {
    try {
      if (!token) {
        return null;
      }

      // If it's stripe or other logic (existing) - skipping for now to focus on VNPay
      // ...

      // VNPay Verification
      if (vnp_ResponseCode) {
         // Construct query string from current URL params to send to backend for checksum validation
         const queryString = window.location.search.substring(1); 
         
         const response = await axios.get(backendUrl + `/api/vnpay/vnpay_return?${queryString}`, { headers: { token } });

         if (response.data.success) {
            setCartItems({});
            navigate('/orders');
            toast.success("Thanh toán thành công!");
         } else {
            navigate('/cart');
            toast.error("Thanh toán thất bại hoặc có lỗi xảy ra.");
         }
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message);
      navigate('/cart');
    }
  }

  useEffect(() => {
    verifyPayment();
  }, [token]);

  return (
    <div className='min-h-[60vh] flex items-center justify-center'>
        <div className="w-20 h-20 border-4 border-gray-200 border-t-4 border-t-primary rounded-full animate-spin"></div>
    </div>
  );
}

export default Verify;
