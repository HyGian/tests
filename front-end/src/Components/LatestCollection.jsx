import { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../Context/ShopContext';
import Title from '../Components/Title';
import ProductItem from '../Components/ProductItem';

const LatestCollection = () => {
  const { products } = useContext(ShopContext);
  const [latestProducts, setLatestProducts] = useState([]);

  useEffect(() => {
    const latest = products.slice(0, 10);
    setLatestProducts(latest);
  }, [products]);

  return (
    <div className="my-10">
      <div className="py-8 text-center text-3xl">
        <Title text1={'BỘ SƯU TẬP'} text2={'MỚI NHẤT'} />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
          Khám phá những sản phẩm mới nhất kết hợp phong cách và sự thoải mái.
          Xu hướng thời trang mới nhất, dành riêng cho bạn.
        </p>
      </div>

      {/* Rendering Products */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {latestProducts.map((product, idx) => (
          <ProductItem
            key={idx}
            id={product._id}
            image={product.image}
            name={product.name}
            price={product.price}
            sizes={product.sizes}
          /> // another way to pass props to a component is to use the spread operator (<ProductItem key={idx} {...product} />)
        ))}
      </div>
    </div>
  );
};

export default LatestCollection;
