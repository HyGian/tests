import { Link } from "react-router-dom";

export default function ProductCard({ product, onAdd }) {
  return (
    <div className="border rounded p-2">
      <Link to={`/product/${product._id}`}>
        <img src={product.image} className="product-image rounded" />
      </Link>
      <h3 className="font-medium mt-2">{product.name}</h3>
      <p className="text-gray-600">{product.price}₫</p>
      <button
        className="mt-2 px-3 py-1 bg-blue-600 text-white rounded"
        onClick={() => onAdd(product)}
      >
        Thêm giỏ hàng
      </button>
    </div>
  );
}
