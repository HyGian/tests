import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../Context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../Components/RelatedProducts';

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart } = useContext(ShopContext);
  const [productsData, setProductsData] = useState(false);
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');

  const fetchProductsData = async () => {
    products.map((product) => {
      if (product._id === productId) {
        setProductsData(product);
        setImage(product.image[0]);

        return null;
      }
    });
  };

  useEffect(() => {
    fetchProductsData();
  }, [productId, products]);

  return productsData ? (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      {/* ---------------------- Products Data ----------------------*/}
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        {/* ---------------------- products images ---------------------- */}

        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row ">
          {/* ---------------------- List images ----------------------*/}
          <div className="flex sm:flex-col  overflow-x-auto sm:overflow-y-scroll justify-between  sm:justify-normal sm:w-[18.7%] w-full">
            {productsData.image.map((item, index) => (
              <img
                key={index}
                src={item}
                alt="product"
                onClick={() => setImage(item)}
                className="cursor-pointer w-[24%]  sm:w-full sm:mb-3 flex-shrink-0  object-cover"
              />
            ))}
          </div>

          {/*---------------------- main img---------------------- */}
          <div className="w-full sm:w-[80%]">
            <img
              src={image}
              alt="product"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* ---------------------- products details ---------------------- */}

        <div className="flex-1">
          <h1 className="font-medium text-2xl mt-2">{productsData.name}</h1>

          {/* <div className="flex items-center gap-1 mt-2">
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_dull_icon} alt="" className="w-3 5" />

            <p className="pl-2">(122)</p>
          </div> */}
          <p className="mt-5 text-3xl font-medium">
            {productsData.price.toLocaleString()}{currency}
          </p>
          <p className="mt-5 text-gray-500 md:w-4/5 ">
            {productsData.description}
          </p>

          <div className="flex flex-col gap-4 my-8">
            <p className="">Chọn Size</p>
            <div className="flex gap-2">
              {productsData.sizes.map((item, index) => {
                // Support both new object format and legacy string format (just in case)
                const sizeName = typeof item === 'object' ? item.size : item;
                const quantity = typeof item === 'object' ? item.quantity : 1;
                const isOutOfStock = quantity <= 0;

                return (
                  <button
                    key={index}
                    disabled={isOutOfStock}
                    onClick={() => {
                      if (!isOutOfStock) setSize(sizeName);
                    }}
                    className={`w-10 h-10 border bg-gray-100 flex items-center justify-center cursor-pointer relative
                    ${sizeName === size ? 'border-orange-500' : ''}
                    ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-gray-200' : ''}
                    `}
                    title={isOutOfStock ? "Hết hàng" : `Còn lại: ${quantity}`}
                  >
                    {sizeName}
                  </button>
                )
              })}
            </div>
          </div>

          <button
            onClick={() => addToCart(productsData._id, size)}
            className="bg-black text-white py-3 px-8 text-sm active:bg-gray-700"
          >
            THÊM VÀO GIỎ
          </button>

          <hr className="mt-8 sm:w-4/5" />

          <div className="flex flex-col gap-1 mt-5 text-sm text-gray-500">
            <p>Sản phẩm chính hãng 100%</p>
            <p>Miễn phí giao hàng cho đơn hàng trên 1.000.000đ</p>
            <p>Đổi trả dễ dàng trong vòng 7 ngày</p>
          </div>
        </div>
      </div>

      {/* ---------------------- Products Description and review section ----------------------*/}

      <div className="mt-10">
        <div className="flex">
          <b className="px-5 py-3 text-sm border">Mô tả</b>
          {/* <p className="px-5 py-3 text-sm border">Reviews (122)</p> */}
        </div>

        <div className=" flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500 ">
          <p>
            Trang web thương mại điện tử là nền tảng trực tuyến giúp mua và bán
            sản phẩm hoặc dịch vụ qua internet. Nó hoạt động như một chợ
            ảo, nơi các doanh nghiệp và cá nhân giới thiệu sản phẩm, tương tác
            với khách hàng và giao dịch mà không cần hiện diện vật lý.
          </p>
          <p>
            Các trang web thương mại điện tử thường hiển thị sản phẩm cùng
            với mô tả, hình ảnh, giá cả và các biến thể có sẵn (ví dụ: size, màu sắc).
          </p>
        </div>
      </div>

      {/* ----------------------  Display Products  ----------------------*/}

      <RelatedProducts
        category={productsData.category}
        subCategory={productsData.subCategory}
      />
    </div>
  ) : (
    <div className="opacity-0"></div>
  );
};

export default Product;
