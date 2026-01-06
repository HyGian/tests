import { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../Context/ShopContext';
import { assets } from '../assets/assets';
import Title from '../Components/Title';
import ProductItem from '../Components/ProductItem';

const Collection = () => {
  // Lấy dữ liệu từ Context để duy trì trạng thái khi nhấn Back/Forward
  const { 
    products, search, showSearch, categories, subCategories,
    category, setCategory, 
    subCategory, setSubCategory, 
    sortType, setSortType 
  } = useContext(ShopContext);

  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);

  // Hàm xử lý khi chọn/bỏ chọn Danh mục
  const toggleCategory = (e) => {
    const value = e.target.value;
    category.includes(value)
      ? setCategory((prev) => prev.filter((item) => item !== value))
      : setCategory((prev) => [...prev, value]);
  };

  // Hàm xử lý khi chọn/bỏ chọn Loại sản phẩm
  const toggleSubCategory = (e) => {
    const value = e.target.value;
    subCategory.includes(value)
      ? setSubCategory((prev) => prev.filter((item) => item !== value))
      : setSubCategory((prev) => [...prev, value]);
  };

  // HÀM QUAN TRỌNG: Gộp cả Lọc và Sắp xếp để tránh render nhiều lần
  const applyFilterAndSort = () => {
    if (!products || products.length === 0) return; 

    let productsCopy = [...products]; // Tạo bản sao để không ảnh hưởng mảng gốc

    // 1. Lọc theo từ khóa tìm kiếm
    if (showSearch && search) {
      productsCopy = productsCopy.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase().trim())
      );
    }

    // 2. Lọc theo Danh mục (Men, Women, Kids...)
    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        category.includes(item.category)
      );
    }

    // 3. Lọc theo Loại (Topwear, Bottomwear...)
    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        subCategory.includes(item.subCategory)
      );
    }

    // 4. ÁP DỤNG SẮP XẾP NGAY TẠI ĐÂY (Để chiều cao trang ổn định tức thì)
    if (sortType === 'low-high') {
      productsCopy.sort((a, b) => a.price - b.price);
    } else if (sortType === 'high-low') {
      productsCopy.sort((a, b) => b.price - a.price);
    }

    setFilterProducts(productsCopy);
  };

  // Chỉ cần một useEffect để theo dõi mọi thay đổi
  useEffect(() => {
    applyFilterAndSort();
  }, [category, subCategory, search, showSearch, products, sortType]);

  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t">
      
      {/* Cột trái: Bộ lọc */}
      <div className="min-w-52">
        <p
          onClick={() => setShowFilter(!showFilter)}
          className="my-2 text-xl flex items-center cursor-pointer gap-2"
        >
          Bộ lọc
          <img
            src={assets.dropdown_icon}
            alt=""
            className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`}
          />
        </p>

        {/* Category Filter */}
        <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className="mb-3 text-sm font-medium">DANH MỤC</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            {categories.map((item, index) => (
              <p key={index} className="flex gap-2">
                <input
                  type="checkbox"
                  className="w-3"
                  value={item.name}
                  onChange={toggleCategory}
                  // Giữ dấu tích khi người dùng nhấn Back
                  checked={category.includes(item.name)} 
                />
                {item.name}
              </p>
            ))}
          </div>
        </div>

        {/* Sub Category Filter */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className="mb-3 text-sm font-medium">LOẠI</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            {subCategories.map((item, index) => (
              <p key={index} className="flex gap-2">
                <input
                  type="checkbox"
                  className="w-3"
                  value={item.name}
                  onChange={toggleSubCategory}
                  // Giữ dấu tích khi người dùng nhấn Back
                  checked={subCategory.includes(item.name)} 
                />
                {item.name}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Cột phải: Danh sách sản phẩm */}
      <div className="flex-1">
        <div className="flex justify-between text-sm sm:text-xl lg:text-2xl mb-4">
          <Title text1={'TẤT CẢ'} text2={'SẢN PHẨM'} />

          {/* Sắp xếp */}
          <select
            onChange={(e) => setSortType(e.target.value)}
            value={sortType}
            className="border border-gray-300 text-sm px-2"
          >
            <option value="relevant">Sắp xếp: Liên quan</option>
            <option value="low-high">Sắp xếp: Giá tăng</option>
            <option value="high-low">Sắp xếp: Giá giảm</option>
          </select>
        </div>

        {/* Render danh sách sản phẩm */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 gap-y-6">
          {filterProducts.map((product) => (
            <ProductItem
              key={product._id}
              id={product._id}
              image={product.image}
              name={product.name}
              price={product.price}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Collection;