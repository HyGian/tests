import React, { useState, useEffect } from "react";

const ProductModal = ({ close, save, editProduct }) => {
  const [data, setData] = useState({
    name: "",
    price: "",
    category: "",
  });

  useEffect(() => {
    if (editProduct) setData(editProduct);
  }, [editProduct]);

  const change = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow w-80">
        <h1 className="text-xl mb-4 font-semibold">
          {editProduct ? "Edit Product" : "Add Product"}
        </h1>

        <div className="flex flex-col gap-3">
          <input
            className="border p-2 rounded"
            name="name"
            placeholder="Name"
            value={data.name}
            onChange={change}
          />

          <input
            className="border p-2 rounded"
            name="price"
            placeholder="Price"
            value={data.price}
            onChange={change}
          />

          <input
            className="border p-2 rounded"
            name="category"
            placeholder="Category"
            value={data.category}
            onChange={change}
          />
        </div>

        <div className="flex justify-end mt-4 gap-3">
          <button className="px-4 py-2" onClick={close}>
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => save(data)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
