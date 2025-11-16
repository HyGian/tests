import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

const Dashboard = () => {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Revenue",
        data: [1200, 1900, 900, 1500, 2200, 2600],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="p-5 bg-white rounded-lg shadow flex flex-col">
          <span className="text-gray-600 text-sm">Total Revenue</span>
          <span className="text-2xl font-bold">$12,450</span>
        </div>

        <div className="p-5 bg-white rounded-lg shadow flex flex-col">
          <span className="text-gray-600 text-sm">Orders</span>
          <span className="text-2xl font-bold">326</span>
        </div>

        <div className="p-5 bg-white rounded-lg shadow flex flex-col">
          <span className="text-gray-600 text-sm">Products</span>
          <span className="text-2xl font-bold">58</span>
        </div>
      </div>

      {}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-3">Revenue (6 months)</h2>
        <Line data={data} />
      </div>
    </div>
  );
};

export default Dashboard;
