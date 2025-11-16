import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/Dashboard";
import Products from "./admin/Products";
import Orders from "./admin/Orders";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Pages */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
