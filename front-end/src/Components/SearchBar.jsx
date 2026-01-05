import { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../Context/ShopContext';
import { assets } from '../assets/assets';
import { useLocation } from 'react-router-dom';

const SearchBar = () => {
  
  const { search, setSearch, showSearch, setShowSearch } =
    useContext(ShopContext);

  const [visible, setVisible] = useState(showSearch);
  const [animate, setAnimate] = useState('');

  const location = useLocation();

  useEffect(() => {
    if (location.pathname.includes('collection')) {
      setVisible(true);
      setAnimate('animate-scale-up-center');
    } else {
      setVisible(false);
    }
  }, [location, showSearch]); 

  const handleClose = () => {
    setAnimate('animate-scale-down-center');
    setTimeout(() => setShowSearch(false), 400); 
  };

  return visible && showSearch ? (
    <div className={`border-t border-b bg-gray-50 text-center ${animate} `}>
      <div className="w-[450px] inline-flex items-center justify-center border border-gray-400 px-5 py-2 my-8 rounded-full ">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className=" flex-1 outline-none bg-inherit text-sm "
        ></input>
        <img src={assets.search_icon} alt="" className="w-4" />
      </div>
      <img
        src={assets.cross_icon}
        alt=""
        className="w-4 h-4 ml-3 inline  cursor-pointer"
        onClick={handleClose}
      />
    </div>
  ) : null; 
};

export default SearchBar;
