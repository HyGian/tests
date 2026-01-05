import PropTypes from 'prop-types';
import { useContext } from 'react';
import { ShopContext } from '../Context/ShopContext';
import { Link } from 'react-router-dom';

const ProductItem = ({ id, image, name, price, sizes }) => {
  const { currency } = useContext(ShopContext);

  // Calculate total stock from sizes array
  let totalStock = 0;
  if (sizes && Array.isArray(sizes)) {
    sizes.forEach(item => {
      if (typeof item === 'object' && item.quantity) {
        totalStock += item.quantity;
      }
    });
  }

  return (
    <Link to={`/product/${id}`} className="text-gray-700 cursor-pointer">
      <div className="overflow-hidden border rounded-lg p-4 shadow-sm h-[320px]">
        <img
          src={image[0]}
          alt=""
          className="w-full h-48 object-cover mb-2 rounded hover:scale-110 transition ease-in-out duration-500 "
        />
        <p className="pt-3 pb-1 text-sm ">{name}</p>
        <p className="text-sm font-medium">
          {price.toLocaleString()}{currency}
        </p>
        <p className={`text-xs mt-1 ${totalStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
          {totalStock > 0 ? `Còn ${totalStock} sản phẩm` : 'Hết hàng'}
        </p>
      </div>
    </Link>
  );
};

// Add prop validation
ProductItem.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  image: PropTypes.arrayOf(PropTypes.string),
  price: PropTypes.number,
  sizes: PropTypes.array,
};
export default ProductItem;

