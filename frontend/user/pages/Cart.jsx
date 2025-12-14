import { UserContext } from "../contexts/UserContext";
import { useContext } from "react";
import { Link } from "react-router-dom";

export default function Cart() {
  const { cart } = useContext(UserContext);

  const total = cart.reduce((s, p) => s + p.price * p.qty, 0);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Giỏ hàng</h1>

      {cart.length === 0 ? (
        <div>Giỏ hàng trống</div>
      ) : (
        cart.map((i) => (
          <div key={i._id} className="border p-2 mb-2 flex justify-between">
            <span>{i.name} × {i.qty}</span>
            <span>{i.price * i.qty}₫</span>
          </div>
        ))
      )}

      <div className="mt-4 font-semibold">Tổng: {total}₫</div>

      <Link
        to="/checkout"
        className="inline-block mt-4 px-4 py-2 bg-green-600 text-white rounded"
      >
        Thanh toán
      </Link>
    </div>
  );
}
