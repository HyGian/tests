import { useEffect, useState, useContext } from "react";
import API from "../api";
import ProductCard from "../components/ProductCard";
import { UserContext } from "../contexts/UserContext";

export default function Home() {
  const [products, setProducts] = useState([]);
  const { addToCart } = useContext(UserContext);

  useEffect(() => {
    API.get("/products").then((res) => setProducts(res.data));
  }, []);

  return (
    <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map((p) => (
        <ProductCard key={p._id} product={p} onAdd={addToCart} />
      ))}
    </div>
  );
}
