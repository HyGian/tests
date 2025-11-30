<<<<<<< HEAD
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../UserContext';
import '../styles/auth.css';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useContext(UserContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.name || !formData.phone || !formData.password || !formData.confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (formData.phone.length < 10) {
      setError('Số điện thoại không hợp lệ');
      return;
    }

    setLoading(true);
    
    const result = await register(formData.name, formData.phone, formData.password);
    
    if (result.success) {
      navigate('/profile');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-background"></div>
      <div className="auth-card">
        <div className="auth-header">
          <h1>Đăng Ký</h1>
          <p>Tạo tài khoản mới</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-message">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Họ và tên</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập họ và tên"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Số điện thoại</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu"
              required
            />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              'Đăng Ký'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Đã có tài khoản?{' '}
            <Link to="/login" className="auth-link">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
=======
import { useState } from "react";
import API from "../../api";

export default function Register() {
  const [form, setForm] = useState({ email: "", password: "", name: "" });

  const submit = async () => {
    await API.post("/auth/register", form);
    alert("Đăng ký thành công");
  };

  return (
    <div className="p-4 max-w-sm mx-auto">
      <h1 className="text-xl font-bold mb-3">Đăng ký</h1>

      <input
        className="border w-full p-2 mb-2"
        placeholder="Họ tên"
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <input
        className="border w-full p-2 mb-2"
        placeholder="Email"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <input
        className="border w-full p-2 mb-2"
        placeholder="Mật khẩu"
        type="password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={submit}
      >
        Đăng ký
      </button>
>>>>>>> 7bffe7c (Cập nhập User fortend)
    </div>
  );
}
