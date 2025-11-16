import React, { useState } from "react";
import ProductModal from "./ProductModal";

const Products = () => {
  const [products, setProducts] = useState([
    { id: 1, name: "T-Shirt", price: 19.99, category: "Men" },
    { id: 2, name: "Dress", price: 39.99, category: "Women" },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const openAddModal = () => {
    setEditProduct(null);
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditProduct(product);
    setModalOpen(true);
  };

  const deleteProduct = (id) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <div className="p-6 w-full">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow"
          onClick={openAddModal}
        >
          + Add Product
        </button>
      </div>

      
      <table className="w-full bg-white shadow rounded-lg overflow-hidden">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Price</th>
            <th className="p-3">Category</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="p-3">{p.name}</td>
              <td className="p-3">${p.price}</td>
              <td className="p-3">{p.category}</td>
              <td className="p-3 flex justify-center gap-3">
                <button
                  className="px-3 py-1 bg-yellow-500 text-white rounded"
                  onClick={() => openEditModal(p)}
                >
                  Edit
                </button>
                <button
                  className="px-3 py-1 bg-red-600 text-white rounded"
                  onClick={() => deleteProduct(p.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {}
      {modalOpen && (
        <ProductModal
          close={() => setModalOpen(false)}
          editProduct={editProduct}
          save={(newProduct) => {
            if (editProduct) {
              setProducts(
                products.map((p) =>
                  p.id === editProduct.id ? newProduct : p
                )
              );
            } else {
              setProducts([...products, { ...newProduct, id: Date.now() }]);
            }

            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default Products;
