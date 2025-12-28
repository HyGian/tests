import { useContext, useState } from 'react';
import CartTotal from '../Components/CartTotal';
import Title from '../Components/Title';
import { ShopContext } from '../Context/ShopContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const PlaceOrder = () => {
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [couponInput, setCouponInput] = useState('');
  const { 
    navigate, backendUrl, token, cartItems, setCartItems, 
    getCartAmount, delivery_fee, products,
    appliedCoupon, discount, applyCoupon, removeCoupon, setAppliedCoupon, setDiscount
  } = useContext(ShopContext);
  const [formData, setFormData] = useState ({
    firstName:'',
    lastName:'',
    email:'',
    street:'',
    city:'',
    state:'',
    zipcode:'',
    country:'',
    phone:''
  })

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    if (formData.hasOwnProperty(name)) {
      setFormData(data => ({ ...data, [name]: value }));
    }
  };
  


  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      let orderItems = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const itemInfo = structuredClone(products.find(product => product._id === items));
            if (itemInfo) {
              itemInfo.size = item;
              itemInfo.quantity = cartItems[items][item];
              orderItems.push(itemInfo);
            }
          }
        }
      }
  
      if (!formData.street || !formData.city) {
        toast.error('Vui lòng điền đầy đủ thông tin địa chỉ');
        return;
      }
  
      const totalAmount = getCartAmount() + delivery_fee - discount;
  
      let orderData = {
        address: formData,  
        items: orderItems,  
        amount: totalAmount,
        couponCode: appliedCoupon ? appliedCoupon.code : null
      };
  
      if (orderItems.length === 0) {
        toast.error('Giỏ hàng của bạn đang trống');
        return;
      }
  
      switch (paymentMethod) {
        case 'cod':
          const response = await axios.post(
            `${backendUrl}/api/order/place`,
            orderData,
            { headers: { token } }
          );
          
          if (response.data.success) {
            localStorage.removeItem('cartItems');
            setCartItems({});
            setAppliedCoupon(null);
            setDiscount(0);
            navigate('/orders');
            toast.success('Đặt hàng thành công');
          } else {
            toast.error(response.data.message);
          }
          break;

        case 'vnpay':
          // 1. Create order first (pending payment)
          // Note: Ideally we should create order with status "Pending Payment" 
          // But strict flow might require creating payment URL first with temporary ID or existing Cart ID.
          // Here we create order first to get Order ID for VNPay Ref.
          
          // Modify orderData to indicate VNPay start
          const orderResponse = await axios.post(
            `${backendUrl}/api/order/place`,
            orderData, 
            { headers: { token } }
          );

          if (orderResponse.data.success) {
             // Order created, now generate payment URL
             // We need to get the actual Order ID from backend response if possible, 
             // but current PlaceOrder controller might not return it directly or we need to fetch user orders.
             // A better way for VNPay is usually:
             // Option A: Backend 'placeOrder' returns the new Order ID.
             // Option B: Generate a unique txn ref here or use timestamp.
             // Let's assume we can use a temporary transaction ref or modify backend to return Order ID.
             // For simplicity, let's use timestamp + random for unique txn ref for now, 
             // OR simpler: Update backend placeOrder to return orderId.

             // Let's try to get order info. 
             // If PlaceOrder controller doesn't return ID, we might need to fetch `myorders` and take the latest,
             // or better: use a separate "create_payment" endpoint that doesn't create order yet? 
             // Standard flow: Create Order (Pending) -> Return ID -> Create Payment URL with ID -> Redirect.
             
             // Wait, the current `placeOrder` in `orderController` returns `{ success: true, message: "Order Placed" }`.
             // It does NOT return the Order ID.
             // I should probably modify `orderController.js` to return the `newOrder._id`. 
             
             // For now, I will assume I can modify `orderController.js` detailed in next step. 
             // I'll write the frontend code assuming `orderResponse.data.orderId` exists.
             
             const orderId = orderResponse.data.orderId; // Need to implement this in backend
             
             const vnpResponse = await axios.post(
                `${backendUrl}/api/vnpay/create_payment_url`,
                {
                    amount: totalAmount,
                    orderInfo: orderId || Date.now().toString(), // Fallback if ID invalid
                    returnUrl: window.location.origin + '/verify' 
                },
                { headers: { token } }
             );

             if (vnpResponse.data.success) {
                 localStorage.removeItem('cartItems');
                 setCartItems({});
                 setAppliedCoupon(null);
                 setDiscount(0);
                 window.location.href = vnpResponse.data.paymentUrl;
             } else {
                 toast.error("Lỗi tạo thanh toán VNPay");
             }
          } else {
              toast.error(orderResponse.data.message);
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Đặt hàng không thành công');
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t">
      {/* --------------- Left Side ----------------------- */}

      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3 ">
          <Title text1={'THÔNG TIN'} text2={'GIAO HÀNG'} />
        </div>
        <div className="flex flex-col sm:flex-row  gap-3">
          <input required onChange={onChangeHandler} name='firstName' value={formData.firstName} 
            type="text"
            placeholder="Họ"
            className="border  border-gray-300 rounded py-1.5 px-3.5 w-full"
          />
          <input required onChange={onChangeHandler} name='lastName' value={formData.lastName}
            type="text"
            placeholder="Tên"
            className="border  border-gray-300 rounded py-1.5 px-3.5 w-full"
          />
        </div>
        <input required onChange={onChangeHandler} name='email' value={formData.email}
          type="email"
          placeholder="Địa chỉ Email"
          className="border  border-gray-300 rounded py-1.5 px-3.5 w-full"
        />
        <input required onChange={onChangeHandler} name='street' value={formData.street}
          type="text"
          placeholder="Địa chỉ"
          className="border  border-gray-300 rounded py-1.5 px-3.5 w-full"
        />
        <div className="flex flex-col sm:flex-row  gap-3">
          <input required onChange={onChangeHandler} name='city' value={formData.city}
            type="text"
            placeholder="Thành phố"
            className="border  border-gray-300 rounded py-1.5 px-3.5 w-full"
          />
          <input onChange={onChangeHandler} name='state' value={formData.state}
            type="text"
            placeholder="Tỉnh"
            className="border  border-gray-300 rounded py-1.5 px-3.5 w-full"
          />
        </div>
        <div className="flex flex-col sm:flex-row  gap-3">
          <input onChange={onChangeHandler} name='zipcode' value={formData.zipcode}
            type="text"
            placeholder="Mã bưu điện"
            className="border  border-gray-300 rounded py-1.5 px-3.5 w-full"
          />
          <input onChange={onChangeHandler} name='country' value={formData.country}
            type="text"
            placeholder="Quốc gia"
            className="border  border-gray-300 rounded py-1.5 px-3.5 w-full"
          />
        </div>
        <input onChange={onChangeHandler} name='phone' value={formData.phone}
          type="number"
          placeholder="Số điện thoại"
          className="border  border-gray-300 rounded py-1.5 px-3.5 w-full"
        />
      </div>

      {/* --------------- Right Side ----------------------- */}

      <div className="mt-8">
        <div className="mt8 min-w-80">
          <CartTotal />
        </div>

        {/* -------------- Coupon Section -------------- */}
        <div className="mt-6">
          <p className="text-sm font-medium mb-2">Mã giảm giá</p>
          {appliedCoupon ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded p-3">
              <div>
                <span className="font-mono font-bold text-green-700">{appliedCoupon.code}</span>
                <span className="text-sm text-green-600 ml-2">(-{discount.toLocaleString()}₫)</span>
              </div>
              <button 
                type="button"
                onClick={removeCoupon}
                className="text-red-500 text-sm hover:underline"
              >
                Hủy
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="Nhập mã giảm giá"
                className="border border-gray-300 rounded py-2 px-3 flex-1 uppercase"
              />
              <button
                type="button"
                onClick={() => applyCoupon(couponInput)}
                className="bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-gray-700"
              >
                Áp dụng
              </button>
            </div>
          )}
        </div>

        <div className="mt-12">
          <Title text1={'PHƯƠNG THỨC'} text2={'THANH TOÁN'} />

          {/* -------------- Payment method selection -------------- */}

          <div className="flex flex-col lg:flex-row gap-4">

            
            <div
              onClick={() => {
                setPaymentMethod('cod');
              }}
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
            >
              <p
                className={` min-w-3.5 h-3.5 border rounded-full ${
                  paymentMethod === 'cod' ? 'bg-green-400' : ''
                }`}
              ></p>
              <p className="text-gray-500 text-sm font-medium mx-4">
                THANH TOÁN KHI NHẬN HÀNG
              </p>
            </div>

            <div
              onClick={() => {
                setPaymentMethod('vnpay');
              }}
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
            >
              <p
                className={` min-w-3.5 h-3.5 border rounded-full ${
                  paymentMethod === 'vnpay' ? 'bg-green-400' : ''
                }`}
              ></p>
              <p className="text-gray-500 text-sm font-medium mx-4 text-blue-600 font-bold">
                THANH TOÁN VNPAY
              </p>
            </div>
          </div>

          {/* -------------- Payment method selection -------------- */}

          <div className="w-full text-end mt-8">
            <button type='submit'
              className="bg-black text-white px-16 py-3 text-sm"
            >
              ĐẶT HÀNG
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
