import { useContext, useState, useEffect } from "react";
import Title from "../Components/Title";
import { ShopContext } from "../Context/ShopContext";
import axios from "axios";

const Orders = () => {
  const { backendUrl, token, orders, products, currency } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);

  // Translation map for order status
  const statusTranslation = {
    "Order Placed": "Đã đặt hàng",
    "Packing": "Đang đóng gói",
    "Shipped": "Đã gửi hàng",
    "Out for delivery": "Đang giao hàng",
    "Delivered": "Đã giao hàng"
  };

  const loadOrderData = async () => {
    try {
      if (!token) return;

      const response = await axios.post(
        `${backendUrl}/api/order/userorders`,
        [],
        { headers: { token } }
      );

      if (response.data.success) {
        let allOrdersItem = [];
        response.data.orders.forEach((order) => {
          order.items.forEach((item) => {
            allOrdersItem.push({
              ...item,
              status: order.status,
              payment: order.payment,
              paymentMethod: order.paymentMethod,
              date: order.date,
            });
          });
        });
        setOrderData(allOrdersItem.reverse()); 
      }
    } catch (error) {
      console.error("Failed to load orders:", error);
    }
  };

  useEffect(() => {
    if (token) {
      loadOrderData();
    }
  }, [token]);

  const formatDate = (date) => {
    if (!date) return "Invalid date";
    const dateObj = new Date(date); 
    if (isNaN(dateObj)) return "Invalid date";
    return dateObj.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="pt-16 border-t">
      <div className="mb-3 text-2xl">
        <Title text1={"ĐƠN HÀNG"} text2={"CỦA TÔI"} />
      </div>

      {orderData.length === 0 ? (
        <p className="text-gray-500">Bạn chưa có đơn hàng nào.</p>
      ) : (
        <div>
          {orderData.map((order, index) => {
            const productData = products.find((product) => product._id === order._id);

            return (
              <div
                key={index}
                className="py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div className="flex items-start gap-6">
                  {productData ? (
                    <img src={productData.image[0]} alt={productData.name} className="w-16 sm:w-20" />
                  ) : (
                    <div className="w-16 sm:w-20 bg-gray-200 flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}

                  <div>
                    <p className="sm:text-base font-medium">{productData ? productData.name : "Unknown Product"}</p>

                    <div className="flex items-center gap-5 mt-2 text-base text-gray-700">
                      <p>
                        {productData ? productData.price.toLocaleString() : "N/A"}{currency}
                      </p>
                      <p>Số lượng: {order.quantity}</p>
                      <p>Kích thước: {order.size}</p>
                    </div>
                    <p className="mt-2">
                      Ngày: <span className="text-gray-400">{formatDate(order.date)}</span>
                    </p>
                    <p className="mt-2">
                      Thanh toán: <span className="text-gray-400">{order.paymentMethod}</span>
                    </p>
                  </div>
                </div>

                <div className="flex justify-between md:w-1/2">
                  <div className="flex items-center gap-2">
                    <p className="min-w-2 h-2 rounded-full bg-green-400"></p>
                    <p className="text-sm md:text-base">{statusTranslation[order.status] || order.status || "Chờ xử lý"}</p>
                  </div>
                  <button onClick={loadOrderData} className="border px-4 py-2 text-sm font-medium rounded-sm text-gray-700">
                    Theo dõi đơn hàng
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
