import { useEffect, useState, useContext } from "react";
import API from "../api";
import ProductCard from "../component/ProductCard";
import { UserContext } from "../UserContext";

export default function Collection() {
  const [products, setProducts] = useState([]);
  const { addToCart } = useContext(UserContext);

  useEffect(() => {
    API.get("/products").then((res) => setProducts(res.data));
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 p-4 gap-4 product-grid">
      {products.map((p) => (
        <ProductCard key={p._id} product={p} onAdd={addToCart} />
      ))}
    </div>
  );
}
