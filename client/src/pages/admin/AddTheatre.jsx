import { Fragment, useState } from "react";
import { toast } from "react-toastify";
import { FiTrash2, FiMapPin } from "react-icons/fi";
import api, { errMsg } from "../../api";
import useFetch from "../../hooks/useFetch";
import Loader from "../../components/Loader";
import { SECTIONS, rupees } from "../../utils";

const EMPTY = {
  theatreName: "", location: "",
  balconySeatPrice: 0, balconySeatCount: 0,
  middleSeatPrice: 0, middleSeatCount: 0,
  lowerSeatPrice: 0, lowerSeatCount: 0,
};

export default function AddTheatre() {
  const { data, loading, setData } = useFetch("/theatre");
  const theatres = data?.theatres || [];
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);

  const onChange = (e) => {
    const { name, value, type } = e.target;
    setForm({ ...form, [name]: type === "number" ? (value === "" ? "" : Number(value)) : value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data: res } = await api.post("/theatre", form);
      setData({ theatres: [...theatres, res.theatre] });
      setForm(EMPTY);
      toast.success("Theatre added");
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (t) => {
    if (!window.confirm(`Delete ${t.theatreName}?`)) return;
    try {
      await api.delete(`/theatre/${t._id}`);
      setData({ theatres: theatres.filter((x) => x._id !== t._id) });
      toast.success("Theatre deleted");
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <main className="page">
      <form className="panel panel--narrow" onSubmit={onSubmit}>
        <h1 className="center">Add <span className="accent">Theatre</span></h1>
        <div className="form-grid">
          <label className="span-2">
            Theatre Name
            <input name="theatreName" value={form.theatreName} onChange={onChange} required />
          </label>
          <label className="span-2">
            Theatre Location
            <input name="location" value={form.location} onChange={onChange} required />
          </label>
          {SECTIONS.map((s) => (
            <Fragment key={s.key}>
              <label>
                {s.label} Seat Price (₹)
                <input name={s.priceField} type="number" min="0" value={form[s.priceField]} onChange={onChange} required />
              </label>
              <label>
                {s.label} Seat Count
                <input name={s.countField} type="number" min="0" max="500" value={form[s.countField]} onChange={onChange} required />
              </label>
            </Fragment>
          ))}
        </div>
        <button className="btn btn--primary" disabled={busy}>{busy ? "Saving..." : "Submit"}</button>
      </form>

      <h1 className="section-title">Your <span className="accent">Theatres</span></h1>
      {loading ? (
        <Loader />
      ) : theatres.length === 0 ? (
        <p className="empty">No theatres yet.</p>
      ) : (
        <div className="show-grid">
          {theatres.map((t) => (
            <article key={t._id} className="show-card">
              <h3>{t.theatreName}</h3>
              <p className="muted"><FiMapPin /> {t.location}</p>
              <dl>
                {SECTIONS.map((s) => (
                  <Fragment key={s.key}>
                    <dt>{s.label}</dt>
                    <dd>{t[s.countField]} seats · {rupees(t[s.priceField])}</dd>
                  </Fragment>
                ))}
              </dl>
              <button className="btn btn--outline-danger" onClick={() => remove(t)} aria-label="Delete theatre">
                <FiTrash2 />
              </button>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
