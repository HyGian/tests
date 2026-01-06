import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    if (navType === 'PUSH') {
      window.scrollTo(0, 0);
    } 
    else if (navType === 'POP') {
      // Lấy vị trí đã lưu từ sessionStorage (nếu có)
      const savedPosition = sessionStorage.getItem(`scroll-${pathname}`);
      
      // Đợi sản phẩm render xong mới cuộn
      setTimeout(() => {
        if (savedPosition) {
          window.scrollTo(0, parseInt(savedPosition));
        }
      }, 100); 
    }
  }, [pathname, navType]);

  // Lưu vị trí cuộn mỗi khi người dùng cuộn trang
  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem(`scroll-${window.location.pathname}`, window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return null;
};

export default ScrollToTop;