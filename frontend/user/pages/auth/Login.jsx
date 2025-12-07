import { useState, useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import API from "../../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const { login } = useContext(UserContext);

  const submit = async () => {
    const res = await API.post("/auth/login", { email, password });
    login(res.data.token);
  };

  return (
    <div className="p-4 max-w-sm mx-auto">
      <h1 className="text-xl font-bold mb-3">Đăng nhập</h1>

      <input
        className="border w-full p-2 mb-2"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="border w-full p-2 mb-2"
        placeholder="Mật khẩu"
        type="password"
        onChange={(e) => setPass(e.target.value)}
      />

      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={submit}>
        Đăng nhập
      </button>
    </div>
  );
}
