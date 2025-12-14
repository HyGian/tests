import { useState } from "react";
import API from "../../api";

export default function Register() {
  const [form, setForm] = useState({ email: "", password: "", name: "" });

  const submit = async () => {
    await API.post("/auth/register", form);
    alert("Đăng ký thành công");
  };

  return (
    <div className="p-4 max-w-sm mx-auto">
      <h1 className="text-xl font-bold mb-3">Đăng ký</h1>

      <input
        className="border w-full p-2 mb-2"
        placeholder="Họ tên"
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <input
        className="border w-full p-2 mb-2"
        placeholder="Email"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <input
        className="border w-full p-2 mb-2"
        placeholder="Mật khẩu"
        type="password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={submit}
      >
        Đăng ký
      </button>
    </div>
  );
}
