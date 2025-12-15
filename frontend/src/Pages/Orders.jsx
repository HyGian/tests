import { useContext, useState, useEffect } from "react";
import Title from "../Components/Title";
import { ShopContext } from "../Context/ShopContext";
import axios from "axios";

const Orders = () => {
  const { backendUrl, token, orders, products, currency } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);

  const loadOrderData = async () => {
    try {
      if (!token) return;

      const response = await axios.get(`${backendUrl}/order/InfoOrder/InfoOrderSuccsessfull`, { headers: { Authorization: `Bearer ${token}` } });

      if (response.data.err === 0) {
        let allOrdersItem = [];
        (response.data.response || []).forEach((order) => {
          (order.items || []).forEach((item) => {
            allOrdersItem.push({
              ...item,
              status: order.status,
              payment: order.payment,
              paymentMethod: order.paymentMethod,
              date: order.createdAt,
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
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="pt-16 border-t">
      <div className="mb-3 text-2xl">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>

      {orderData.length === 0 ? (
        <p className="text-gray-500">You have no orders.</p>
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
                        {currency}
                        {productData ? productData.price : "N/A"}
                      </p>
                      <p>Quantity: {order.quantity}</p>
                      <p>Size: {order.size}</p>
                    </div>
                    <p className="mt-2">
                      Date: <span className="text-gray-400">{formatDate(order.date)}</span>
                    </p>
                    <p className="mt-2">
                      Payment: <span className="text-gray-400">{order.paymentMethod}</span>
                    </p>
                  </div>
                </div>

                <div className="flex justify-between md:w-1/2">
                  <div className="flex items-center gap-2">
                    <p className="min-w-2 h-2 rounded-full bg-green-400"></p>
                    <p className="text-sm md:text-base">{order.status || "Pending"}</p>
                  </div>
                  <button onClick={loadOrderData} className="border px-4 py-2 text-sm font-medium rounded-sm text-gray-700">
                    Track Order
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
