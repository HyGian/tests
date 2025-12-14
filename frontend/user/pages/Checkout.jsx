import { useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const { cart } = useContext(UserContext);
  const navigate = useNavigate();

  const total = cart.reduce((s, p) => s + p.price * p.qty, 0);

  const placeOrder = async () => {
    const res = await API.post("/orders", { items: cart, total });
    if (res.data) {
      alert("Đặt hàng thành công!");
      navigate("/");
    }
  };

  return (
    <div className="p-4">
      <h1 className="font-bold text-xl">Thanh toán</h1>
      <div className="mb-4">Tổng tiền: {total}₫</div>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={placeOrder}
      >
        Xác nhận
      </button>
    </div>
  );
}
