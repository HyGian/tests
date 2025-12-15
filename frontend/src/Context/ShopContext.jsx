import PropTypes from 'prop-types';
import { createContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const currency = '$';
  const delivery_fee = 10;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  const navigate = useNavigate();

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

    if (token) {
      try {
        const product = products.find((p) => p._id === itemId);
        if (!product) return;

        await axios.post(
          `${backendUrl}/order`,
          {
            name: product.name,
            productId: itemId,
            size,
            quantity: updatedCart[itemId][size],
            price: product.price,
            imageUrl: Array.isArray(product.image) ? product.image[0] : ''
          },
          { headers: { token } }
        );
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
          const product = products.find((p) => p._id === item);
          if (!product) continue;
          newOrder.push({
            _id: item,
            name: product.name,
            size,
            quantity: cartItems[item][size],
            price: product.price,
            imageUrl: Array.isArray(product.image) ? product.image[0] : ''
          });
        }
      }
    }

    try {
      await Promise.all(
        newOrder.map((orderItem) =>
          axios.post(
            `${backendUrl}/order`,
            {
              name: orderItem.name,
              productId: orderItem._id,
              size: orderItem.size,
              quantity: orderItem.quantity,
              price: orderItem.price,
              imageUrl: orderItem.imageUrl
            },
            { headers: { token } }
          )
        )
      );

      setOrders([...orders, ...newOrder]);
      setCartItems({});
      localStorage.removeItem('cartItems');
      navigate('/orders');
    } catch (error) {
      console.error(error);
      toast.error('Order failed. Please try again.');
    }
  };
  

  const updateQuantity = async (itemId, size, quantity) => {
    if (!token) {
      toast.error('User not authenticated');
      return;
    }

    const updatedCart = { ...cartItems };

    if (quantity > 0) {
      if (!updatedCart[itemId]) updatedCart[itemId] = {};
      updatedCart[itemId][size] = quantity;
    } else if (updatedCart[itemId]) {
      delete updatedCart[itemId][size];
      if (Object.keys(updatedCart[itemId]).length === 0) delete updatedCart[itemId];
    }

    setCartItems(updatedCart);
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
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
      const response = await axios.get(`${backendUrl}/product/all`);
      if (response.data.err === 0) {
        const normalized = (response.data.response || []).map((product) => ({
          ...product,
          image: product.image || product.images?.map((img) => img.imageUrl) || [],
          sizes: product.sizes || product.info?.map((info) => info.version || info.size).filter(Boolean) || [],
          description: product.description || product.info?.[0]?.information || ''
        }));
        setProducts(normalized);
      } else {
        toast.error(response.data.msg || 'Failed to load products');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const fetchUserCart = async () => {
    try {
      const response = await axios.get(`${backendUrl}/order/shopping-cart`, { headers: { token } });

      if (response.data.err === 0) {
        const cartData = {};
        (response.data.response || []).forEach((order) => {
          (order.items || []).forEach((item) => {
            const productId = item.product?._id || item.product;
            const sizeKey = item.size || 'default';
            if (!productId) return;
            if (!cartData[productId]) cartData[productId] = {};
            cartData[productId][sizeKey] = (cartData[productId][sizeKey] || 0) + (item.quantity || 0);
          });
        });

        setCartItems(cartData);
        localStorage.setItem('cartItems', JSON.stringify(cartData));
      } else {
        toast.error(response.data.msg || 'Failed to fetch cart data.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch cart data.');
    }
  };
  
 

  useEffect(() => {
    fetchProducts();

    if (token) {
      fetchUserCart();
    } else {
      const savedCart = localStorage.getItem('cartItems');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    }
  }, [token]);

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
  }; 


  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

ShopContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};


export default ShopContextProvider;
