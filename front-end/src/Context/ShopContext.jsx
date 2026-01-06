import PropTypes from 'prop-types';
import { createContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  
  const currency = '₫';
  const delivery_fee = 30000;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [userData, setUserData] = useState(null);
  const [socket, setSocket] = useState(null);


  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const navigate = useNavigate();
  const fetchUserProfile = async () => {
    if (!token) return;
    try {
      const response = await axios.get(backendUrl + '/api/user/profile', { headers: { token } });
      if (response.data.success) {
        setUserData(response.data.user);
      }
    } catch (error) {
      console.error("Lỗi lấy profile:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserProfile();
      const newSocket = io(backendUrl);
      setSocket(newSocket);
      return () => newSocket.disconnect();
    }
  }, [token]);

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error('Please select a size');
      return;
    }

    const updatedCart = { ...cartItems };

    if (!updatedCart[itemId]) updatedCart[itemId] = {};
    updatedCart[itemId][size] = (updatedCart[itemId][size] || 0) + 1;

    setCartItems(updatedCart);
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
    toast.success('Đã thêm sản phẩm vào giỏ hàng');


    if (token) {
      try {
        await axios.post(`${backendUrl}/api/cart/add`, { itemId, size }, { headers: { token } });
      } catch (error) {
        console.error(error);
        toast.error(error.message);
      }
    }
  };

  const addOrder = async () => {
    const newOrder = [];
  
    for (const item in cartItems) {
      for (const size in cartItems[item]) {
        if (cartItems[item][size] > 0) {
          newOrder.push({ _id: item, size, quantity: cartItems[item][size] });
        }
      }
    }
  
    try {
      const response = await axios.post(`${backendUrl}/api/order/place`, { items: newOrder }, { headers: { token } });
  
      if (response.data.success) {
        setOrders([...orders, ...newOrder]);
        setCartItems({});
        localStorage.removeItem('cartItems');
        navigate('/orders');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Order failed. Please try again.");
    }
  };
  

  const updateQuantity = async (itemId, size, quantity) => {
    if (!token) {
      toast.error("User not authenticated");
      return;
    }
  
    const updatedCart = { ...cartItems };
  
    if (quantity > 0) {
      if (!updatedCart[itemId]) updatedCart[itemId] = {};
      updatedCart[itemId][size] = quantity;
    } else {
      if (updatedCart[itemId]) {
        delete updatedCart[itemId][size];
        if (Object.keys(updatedCart[itemId]).length === 0) delete updatedCart[itemId];
      }
    }
  
    setCartItems(updatedCart);
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
  
    try {
      const response = await axios.post(
         `${backendUrl}/api/cart/update`, 
         { itemId, size, quantity }, 
         { headers: { token } }
      );
   
      if (!response.data.success) throw new Error(response.data.message);
   
      setCartItems(updatedCart); 
      localStorage.setItem('cartItems', JSON.stringify(updatedCart));
   
   } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update cart");
   }
   
  };
  

  const getCartCount = () => {
    return Object.values(cartItems).reduce(
      (total, item) => total + Object.values(item).reduce((sum, qty) => sum + qty, 0),
      0
    );
  };

  const getCartAmount = () => {
    return Object.entries(cartItems).reduce((total, [itemId, sizes]) => {
      const product = products.find((p) => p._id === itemId);
      return product
        ? total + Object.values(sizes).reduce((sum, qty) => sum + product.price * qty, 0)
        : total;
    }, 0);
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const fetchUserCart = async () => {
    try {
      const response = await axios.post(`${backendUrl}/api/cart/get`, {}, { headers: { token } });
  
      if (response.data.success) {
        setCartItems(response.data.cartData);
        localStorage.setItem('cartItems', JSON.stringify(response.data.cartData)); 
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch cart data.");
    }
  };
  
 

  const fetchCategories = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/category/list');
      if (response.data.success) setCategories(response.data.categories);
    } catch (error) {
      console.log(error);
    }
  }

  const fetchSubCategories = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/category/sub/list');
      if (response.data.success) setSubCategories(response.data.subCategories);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSubCategories();

    if (token) {
      fetchUserCart();
    } else {
      const savedCart = localStorage.getItem('cartItems');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      } else {
        setCartItems({});
      }
    }
  }, [token]);

  const applyCoupon = async (code) => {
    try {
      const cartAmount = getCartAmount();
      const response = await axios.post(
        `${backendUrl}/api/coupon/validate`,
        { code, cartAmount },
        { headers: { token } }
      );

      if (response.data.success) {
        setAppliedCoupon(response.data.coupon);
        setDiscount(response.data.coupon.discount);
        toast.success(`Áp dụng mã ${response.data.coupon.code} thành công!`);
        return true;
      } else {
        toast.error(response.data.message);
        return false;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Mã giảm giá không hợp lệ');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    toast.info('Đã hủy mã giảm giá');
  };

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    addOrder,
    orders,
    navigate,
    backendUrl,
    setToken,
    token,
    setCartItems,
    appliedCoupon,
    discount,
    applyCoupon,
    removeCoupon,
    setAppliedCoupon,
    setDiscount,
    categories,
    subCategories,
    userData,
    socket
  }; 


  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

ShopContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};


export default ShopContextProvider;