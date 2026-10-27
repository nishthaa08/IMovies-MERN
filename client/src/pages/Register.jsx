import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { errMsg } from "../api";

export default function Register({ admin = false }) {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "", adminKey: "" });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.username.trim().length < 3) return toast.error("Username must be at least 3 characters");
    if (form.password.length < 8) return toast.error("Password must be at least 8 characters");
    if (form.password !== form.confirm) return toast.error("Passwords do not match");

    setBusy(true);
    try {
      const { username, email, password, adminKey } = form;
      await register({ username: username.trim(), email, password, ...(admin && { adminKey }) }, admin);
      toast.success("Account created");
      navigate(admin ? "/admin" : "/home", { replace: true });
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const type = show ? "text" : "password";

  return (
    <main className="auth">
      <form className="auth__card" onSubmit={onSubmit}>
        <div className="brand brand--center"><span className="brand__i">i</span>Movies</div>
        <h2>{admin ? "Admin Register" : "Register"}</h2>

        <label>
          Username
          <input name="username" placeholder="Enter username" value={form.username} onChange={onChange} required maxLength={20} />
        </label>
        <label>
          Email
          <input name="email" type="email" placeholder="Enter your email" value={form.email} onChange={onChange} required maxLength={50} />
        </label>
        <label>
          Password
          <input name="password" type={type} placeholder="At least 8 characters" value={form.password} onChange={onChange} required autoComplete="new-password" />
        </label>
        <label>
          Confirm Password
          <input name="confirm" type={type} placeholder="Confirm your password" value={form.confirm} onChange={onChange} required autoComplete="new-password" />
        </label>
        {admin && (
          <label>
            Admin key <small>(only if your server sets one)</small>
            <input name="adminKey" type="password" placeholder="Optional" value={form.adminKey} onChange={onChange} />
          </label>
        )}
        <label className="check">
          <input type="checkbox" checked={show} onChange={() => setShow(!show)} /> Show Password
        </label>

        <button className="btn btn--primary" disabled={busy}>{busy ? "Creating..." : "Submit"}</button>

        <p className="auth__alt">
          Already have an account? <Link to={admin ? "/admin/login" : "/login"}>Login</Link>
        </p>
        <p className="auth__alt">
          {admin ? <>Not an admin? <Link to="/register">User sign up</Link></> : <>Register as an <Link to="/admin/register">Admin</Link></>}
        </p>
      </form>
    </main>
  );
}
