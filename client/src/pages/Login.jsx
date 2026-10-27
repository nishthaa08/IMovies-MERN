import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { errMsg } from "../api";

export default function Login({ admin = false }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await login(form.email, form.password, admin);
      toast.success(`Welcome back, ${user.username}`);
      navigate(admin ? "/admin" : location.state?.from || "/home", { replace: true });
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth">
      <form className="auth__card" onSubmit={onSubmit}>
        <div className="brand brand--center"><span className="brand__i">i</span>Movies</div>
        <h2>{admin ? "Admin Login" : "Login"}</h2>

        <label>
          Email
          <input name="email" type="email" placeholder="Enter your email" value={form.email} onChange={onChange} required autoComplete="email" />
        </label>
        <label>
          Password
          <input name="password" type={show ? "text" : "password"} placeholder="Enter your password" value={form.password} onChange={onChange} required autoComplete="current-password" />
        </label>
        <label className="check">
          <input type="checkbox" checked={show} onChange={() => setShow(!show)} /> Show Password
        </label>

        <button className="btn btn--primary" disabled={busy}>{busy ? "Logging in..." : "Submit"}</button>

        <p className="auth__alt">
          Create an account? <Link to={admin ? "/admin/register" : "/register"}>Register</Link>
        </p>
        <p className="auth__alt">
          {admin ? <>Not an admin? <Link to="/login">User login</Link></> : <>Login as an <Link to="/admin/login">Admin</Link></>}
        </p>
      </form>
    </main>
  );
}
