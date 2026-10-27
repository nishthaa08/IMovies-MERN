import { useState } from "react";
import { toast } from "react-toastify";
import api, { errMsg } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ username: user.username, currentPassword: "", newPassword: "" });
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { username: form.username.trim() };
      if (form.newPassword) Object.assign(payload, { currentPassword: form.currentPassword, newPassword: form.newPassword });
      const { data } = await api.put("/auth/me", payload);
      updateUser(data.user);
      setForm({ ...form, currentPassword: "", newPassword: "" });
      toast.success("Profile updated");
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth">
      <form className="auth__card" onSubmit={onSubmit}>
        <h2>Your <span className="accent">Profile</span></h2>
        <label>
          Email
          <input value={user.email} disabled />
        </label>
        <label>
          Username
          <input name="username" value={form.username} onChange={onChange} minLength={3} maxLength={20} required />
        </label>
        <p className="muted small">Change password (optional)</p>
        <label>
          Current password
          <input name="currentPassword" type="password" value={form.currentPassword} onChange={onChange} autoComplete="current-password" />
        </label>
        <label>
          New password
          <input name="newPassword" type="password" value={form.newPassword} onChange={onChange} minLength={8} autoComplete="new-password" />
        </label>
        <button className="btn btn--primary" disabled={busy}>{busy ? "Saving..." : "Save"}</button>
      </form>
    </main>
  );
}
