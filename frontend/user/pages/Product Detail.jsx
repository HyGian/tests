import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import API from "../api";
import { UserContext } from "../contexts/UserContext";

export default function ProductDetail() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const { addToCart } = useContext(UserContext);

  useEffect(() => {
    API.get(`/products/${id}`).then((res) => setP(res.data));
  }, []);

  if (!p) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 grid md:grid-cols-2 gap-4">
      <img src={p.image} className="rounded w-full" />
      
      <div>
        <h1 className="text-2xl font-bold">{p.name}</h1>
        <p className="text-gray-600">{p.price}₫</p>

        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => addToCart(p)}
        >
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}
