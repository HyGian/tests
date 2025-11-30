<<<<<<< HEAD
import React, { createContext, useState, useEffect } from 'react';
import API from './api';

export const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
      // Optionally verify token by fetching current user
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await API.get('/user/get-current');
      if (response.data.err === 0) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (phone, password) => {
    try {
      const response = await API.post('/auth/login', { phone, password });
      
      if (response.data.err === 0) {
        const { token } = response.data;
        localStorage.setItem('token', token);
        
        // Fetch user details after login
        await fetchCurrentUser();
        
        return { success: true, message: response.data.msg };
      } else {
        return { success: false, message: response.data.msg };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.msg || 'Đăng nhập thất bại. Vui lòng thử lại.' 
      };
    }
  };

  const register = async (name, phone, password) => {
    try {
      const response = await API.post('/auth/register', { name, phone, password });
      
      if (response.data.err === 0) {
        const { token } = response.data;
        localStorage.setItem('token', token);
        
        // Fetch user details after registration
        await fetchCurrentUser();
        
        return { success: true, message: response.data.msg };
      } else {
        return { success: false, message: response.data.msg };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.msg || 'Đăng ký thất bại. Vui lòng thử lại.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = async (userData) => {
    try {
      const response = await API.put('/user', userData);
      
      if (response.data.err === 0) {
        // Refresh user data
        await fetchCurrentUser();
        return { success: true, message: response.data.msg };
      } else {
        return { success: false, message: response.data.msg };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.msg || 'Cập nhật thông tin thất bại.' 
      };
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
    fetchCurrentUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
=======
import { createContext, useEffect, useState } from "react";
import API from "../api";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await API.get("/users/me");
        setUser(res.data);
      } catch {
        setUser(null);
      }
    })();
  }, [token]);

  const login = (token) => {
    localStorage.setItem("token", token);
    window.location.reload();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const addToCart = (product, qty = 1) => {
    const exists = cart.find((x) => x._id === product._id);
    let newCart;
    if (exists) {
      newCart = cart.map((i) =>
        i._id === product._id ? { ...i, qty: i.qty + qty } : i
      );
    } else {
      newCart = [...cart, { ...product, qty }];
    }
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  return (
    <UserContext.Provider
      value={{ user, login, logout, cart, addToCart }}
    >
      {children}
    </UserContext.Provider>
  );
>>>>>>> 7bffe7c (Cập nhập User fortend)
};
