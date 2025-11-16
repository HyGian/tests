import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-60 bg-white shadow h-screen p-5 flex flex-col gap-4">
      <h1 className="text-lg font-bold mb-4">Admin Panel</h1>

      <Link to="/admin/dashboard" className="hover:text-blue-600">
        Dashboard
      </Link>

      <Link to="/admin/products" className="hover:text-blue-600">
        Products
      </Link>

      <Link to="/admin/orders" className="hover:text-blue-600">
        Orders
      </Link>
    </div>
  );
};

export default Sidebar;
