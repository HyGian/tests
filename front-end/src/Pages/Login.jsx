import { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../Context/ShopContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const [currentState, setCurrentState] = useState('Login');
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (currentState === 'Sign Up') {
        const response = await axios.post(backendUrl + '/api/user/register', { name, email, password });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem('token', response.data.token);
        } else {
          toast.error(response.data.message);
        }
      } else {
        const response = await axios.post(backendUrl + '/api/user/login', { email, password });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem('token', response.data.token);
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Decode the JWT to get user info
      const decoded = jwtDecode(credentialResponse.credential);
      
      const response = await axios.post(backendUrl + '/api/user/google-login', {
        email: decoded.email,
        name: decoded.name,
        googleId: decoded.sub
      });

      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        toast.success('Đăng nhập Google thành công!');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Đăng nhập Google thất bại!');
    }
  };

  const handleGoogleError = () => {
    toast.error('Đăng nhập Google thất bại!');
  };

  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token]);

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">{currentState}</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      <div className="w-full px-3 py-2 flex flex-col gap-4">
        {currentState === 'Sign Up' ? (
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            className="w-full px-3 py-2 border border-gray-300"
            placeholder="Họ và tên"
            required
          />
        ) : null}

        <input
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          type="email"
          className="w-full px-3 py-2 border border-gray-300"
          placeholder="Email"
          required
        />
        <input
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          type="password"
          className="w-full px-3 py-2 border border-gray-300"
          placeholder="Mật khẩu"
          required
        />

        <div className="w-full flex justify-between text-sm mt-[-8px]">
          <p
            onClick={() => navigate('/forgot-password')}
            className="cursor-pointer hover:text-black"
          >
            Quên mật khẩu?
          </p>
          {currentState === 'Login' ? (
            <p onClick={() => setCurrentState('Sign Up')} className="cursor-pointer">
              Tạo tài khoản
            </p>
          ) : (
            <p onClick={() => setCurrentState('Login')} className="cursor-pointer">
              Đăng nhập
            </p>
          )}
        </div>

        <button className="w-1/2 m-auto bg-black text-white px-8 py-2 mt-4">
          {currentState === 'Login' ? 'Đăng Nhập' : 'Đăng Ký'}
        </button>

        {/* Divider */}
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="px-3 text-gray-500 text-sm">hoặc</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Google Login Button */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            text="signin_with"
            shape="rectangular"
            logo_alignment="left"
          />
        </div>
      </div>
    </form>
  );
};

export default Login;

