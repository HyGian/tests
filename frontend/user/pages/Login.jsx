<<<<<<< HEAD
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../UserContext';
import '../styles/auth.css';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!phone || !password) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    
    const result = await login(phone, password);
    
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
          <h1>Đăng Nhập</h1>
          <p>Chào mừng bạn trở lại!</p>
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
            <label htmlFor="phone">Số điện thoại</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
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
              'Đăng Nhập'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Chưa có tài khoản?{' '}
            <Link to="/register" className="auth-link">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
=======
import { useState, useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import API from "../../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const { login } = useContext(UserContext);

  const submit = async () => {
    const res = await API.post("/auth/login", { email, password });
    login(res.data.token);
  };

  return (
    <div className="p-4 max-w-sm mx-auto">
      <h1 className="text-xl font-bold mb-3">Đăng nhập</h1>

      <input
        className="border w-full p-2 mb-2"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="border w-full p-2 mb-2"
        placeholder="Mật khẩu"
        type="password"
        onChange={(e) => setPass(e.target.value)}
      />

      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={submit}>
        Đăng nhập
      </button>
>>>>>>> 7bffe7c (Cập nhập User fortend)
    </div>
  );
}
