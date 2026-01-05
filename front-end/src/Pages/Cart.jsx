import { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../Context/ShopContext';
import Title from '../Components/Title';
import { assets } from '../assets/assets';
import CartTotal from '../Components/CartTotal';

const Cart = () => {
  const { 
    products, 
    currency, 
    cartItems, 
    updateQuantity, 
    navigate, 
    addOrder 
  } = useContext(ShopContext);
  
  const [cartData, setCartData] = useState([]);

  useEffect(() => {
    if (products?.length > 0 && cartItems) {
      const tempData = [];
      for (const itemId in cartItems) {
        const product = products.find(p => p._id === itemId);
        if (!product) {
          console.log('Product not found:', itemId);
          continue;
        }

        if (cartItems[itemId]) {
          for (const size in cartItems[itemId]) {
            if (cartItems[itemId][size] > 0) {
              tempData.push({
                _id: itemId,
                size: size,
                quantity: cartItems[itemId][size],
                product: product 
              });
            }
          }
        }
      }
      setCartData(tempData);
    }
  }, [cartItems, products]);

  if (!products?.length) {
    return <div className="pt-14 text-center">Loading...</div>;
  }

  return (
    <div className="pt-14 border-t">
      <div className="mb-3 text-2xl">
        <Title text1={'GIỎ'} text2={'HÀNG'} />
      </div>

      <div>
        {cartData.map((item, index) => {
          const { product } = item;
          
          return (
            <div
              key={`${item._id}-${item.size}-${index}`}
              className="py-3 border-b border-t text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4"
            >
              <div className="flex items-start gap-6">
                {product.image && product.image[0] && (
                  <img
                    src={product.image[0]}
                    alt={product.name}
                    className="w-16 sm:w-20"
                  />
                )}
                <div>
                  <p className="text-sm sm:text-lg font-medium">
                    {product.name}
                  </p>
                  <div className="flex items-center gap-5 mt-2">
                    <p>
                      {product.price.toLocaleString()}{currency}
                    </p>
                    <p className="px-2 sm:px-3 sm:py-1 border bg-slate-50">
                      {item.size}
                    </p>
                  </div>
                </div>
              </div>

              <input
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || value < 0) return;
                  
                  const numValue = parseInt(value);
                  if (isNaN(numValue)) return;
                  
                  updateQuantity(item._id, item.size, numValue);
                }}
                className="border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1"
                type="number"
                min={1}
                defaultValue={item.quantity}
              />

              <img
                onClick={() => updateQuantity(item._id, item.size, 0)}
                src={assets.bin_icon}
                alt="Remove item"
                className="w-4 mr-4 sm:w-5 cursor-pointer"
              />
            </div>
          );
        })}
      </div>

      {cartData.length > 0 ? (
        <div className="flex justify-end my-20">
          <div className="w-full sm:w-[450px]">
            <CartTotal />
            <div className="w-full text-end">
              <button
                onClick={() => {
                  addOrder();
                  navigate('/place-order');
                }}
                className="my-8 px-8 py-3 bg-black text-white text-sm"
              >
                THANH TOÁN
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          Giỏ hàng của bạn đang trống
        </div>
      )}
    </div>
  );
};

export default Cart;