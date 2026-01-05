import { useContext } from 'react';
import { ShopContext } from '../Context/ShopContext';
import Title from './Title';

const CartTotal = () => {
  const { currency, delivery_fee, getCartAmount, discount, appliedCoupon } = useContext(ShopContext);

  const subtotal = getCartAmount();
  const total = subtotal === 0 ? 0 : subtotal + delivery_fee - discount;

  return (
    <div className="w-full">
      <div className="text-2xl">
        <Title text1={'TỔNG'} text2={'TIỀN'} />
      </div>

      <div className="flex flex-col gap-2 mt-2 text-sm ">
        <div className="flex justify-between">
          <p>Tạm tính</p>
          <p>
            {subtotal.toLocaleString()}{currency}
          </p>
        </div>
        <div className="flex justify-between">
          <p>Phí giao hàng</p>
          <p>
            {delivery_fee.toLocaleString()}{currency}
          </p>
        </div>
        {appliedCoupon && discount > 0 && (
          <div className="flex justify-between text-green-600">
            <p>Giảm giá ({appliedCoupon.code})</p>
            <p>
              -{discount.toLocaleString()}{currency}
            </p>
          </div>
        )}
        <hr className="my-1" />
        <div className="flex justify-between font-semibold text-base">
          <p>Tổng cộng</p>
          <p>
            {total.toLocaleString()}{currency}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartTotal;

