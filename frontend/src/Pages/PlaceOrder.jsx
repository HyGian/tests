import { useContext, useState } from 'react';
import CartTotal from '../Components/CartTotal';
import Title from '../Components/Title';
import { ShopContext } from '../Context/ShopContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const PlaceOrder = () => {
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products } = useContext(ShopContext);
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
        toast.error('Please fill in all required address fields');
        return;
      }
  
      const totalAmount = getCartAmount() + delivery_fee;
  
      let orderData = {
        address: formData,  
        items: orderItems,  
        amount: totalAmount 
      };
  
      if (orderItems.length === 0) {
        toast.error('Your cart is empty');
        return;
      }
  
      switch (paymentMethod) {
        case 'cod':
          await Promise.all(
            orderItems.map((item) =>
              axios.post(
                `${backendUrl}/order`,
                {
                  name: item.name,
                  productId: item._id,
                  size: item.size,
                  quantity: item.quantity,
                  price: item.price,
                  imageUrl: Array.isArray(item.image) ? item.image[0] : ''
                },
                { headers: { token } }
              )
            )
          );

          localStorage.removeItem('cartItems');
          setCartItems({});
          navigate('/orders');
          toast.success('Order placed successfully');
          break;
          // case 'stripe':
          //   const responseStripe = await axios.post(backendUrl + '/api/order/stripe', orderData, {headers:{token}}) 
          //   if (responseStripe.data.success) {
          //     const {session_url} = responseStripe.data
          //     window.location.replace(session_url)
          //   } else {
          //     toast.error(responseStripe.data.message)
          //   }
          //   break;
        default:
          break;
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t">
      {/* --------------- Left Side ----------------------- */}

      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3 ">
          <Title text1={'DELIVERY'} text2={'INFORMATION'} />
        </div>
        <div className="flex flex-col sm:flex-row  gap-3">
          <input required onChange={onChangeHandler} name='firstName' value={formData.firstName} 
            type="text"
            placeholder="First Name"
            className="border  border-gray-300 rounded py-1.5 px-3.5 w-full"
          />
          <input required onChange={onChangeHandler} name='lastName' value={formData.lastName}
            type="text"
            placeholder="Last Name"
            className="border  border-gray-300 rounded py-1.5 px-3.5 w-full"
          />
        </div>
        <input required onChange={onChangeHandler} name='email' value={formData.email}
          type="email"
          placeholder="Email Address"
          className="border  border-gray-300 rounded py-1.5 px-3.5 w-full"
        />
        <input required onChange={onChangeHandler} name='street' value={formData.street}
          type="text"
          placeholder="Street"
          className="border  border-gray-300 rounded py-1.5 px-3.5 w-full"
        />
        <div className="flex flex-col sm:flex-row  gap-3">
          <input required onChange={onChangeHandler} name='city' value={formData.city}
            type="text"
            placeholder="City"
            className="border  border-gray-300 rounded py-1.5 px-3.5 w-full"
          />
          <input onChange={onChangeHandler} name='state' value={formData.state}
            type="text"
            placeholder="State"
            className="border  border-gray-300 rounded py-1.5 px-3.5 w-full"
          />
        </div>
        <div className="flex flex-col sm:flex-row  gap-3">
          <input onChange={onChangeHandler} name='zipcode' value={formData.zipcode}
            type="text"
            placeholder="Zipcode"
            className="border  border-gray-300 rounded py-1.5 px-3.5 w-full"
          />
          <input onChange={onChangeHandler} name='country' value={formData.country}
            type="text"
            placeholder="Country"
            className="border  border-gray-300 rounded py-1.5 px-3.5 w-full"
          />
        </div>
        <input onChange={onChangeHandler} name='phone' value={formData.phone}
          type="number"
          placeholder="Phone"
          className="border  border-gray-300 rounded py-1.5 px-3.5 w-full"
        />
      </div>

      {/* --------------- Right Side ----------------------- */}

      <div className="mt-8">
        <div className="mt8 min-w-80">
          <CartTotal />
        </div>

        <div className="mt-12">
          <Title text1={'PAYMENT'} text2={'METHOD'} />

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
                
                CASH ON DELIVERY
              </p>
            </div>
          </div>

          {/* -------------- Payment method selection -------------- */}

          <div className="w-full text-end mt-8">
            <button type='submit'
              className="bg-black text-white px-16 py-3 text-sm"
            >
              PLACE ORDER
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
